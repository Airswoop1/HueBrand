# Author Gilad Shai
# email spotted.rhino.inc@gmail.com
# url http://spottedrhino.com

import Image
import ImageDraw
import colorsys
import types
from operator import itemgetter
from math import sqrt
from math import ceil
import color_match


RECT = (0, 0, 100, 100)
BOX_WIDTH = 40
BOX_HEIGHT = 40
H_MARGIN = 100
FILTER_MODE = 10
HIST_ELEMENTS = BOX_WIDTH*BOX_HEIGHT
DEBUG = False
SNAP_RADIUS = 50
ALPHA_THRESHOLD = 100

def _crop_image(image, rect):
    try:
        thumb = image.crop(rect)
    except:
        return None
    
    return thumb


def histogram_for_image(image, max_colors=10, snap_radius=SNAP_RADIUS):
    """
    Receives image and create a histogram.
    Removes transparency and background
    """

    # Get dominate colors
    hist_elements = image.size[0] * image.size[1]
    hist_colors = _color_histogram_image(image, hist_elements)
    #print 'hist colors: ', hist_colors

    # Handle transparency if needed
    if image.mode == 'RGBA':
        hist_colors = _remove_transparency_data(hist_colors)

    # Remove opaque background
    if image.mode == 'RGB':
        hist_colors = _remove_opaque_background(image, hist_colors)

    # debug validate
    #_color_histogram_to_image(hist_colors, image.size)

    return hist_colors


def get_dominate_colors_from_hist(image, hist_colors=None, max_colors=10, snap_radius=SNAP_RADIUS):

    # Get histogram from image
    if hist_colors == None:
        hist_colors = histogram_for_image(image, max_colors, snap_radius)

    # Generate image from dominate colors
    dominate_colors = find_dominate_colors(hist_colors, max_colors, snap_radius)
    #print 'dominate colors: ', dominate_colors
    return dominate_colors


def _count_appearance(alist, hist_list):

    hist_dict_list = map(lambda x: {'rgb': x[1], 'hist': x[0]}, hist_list)

    results = []
    for obj in alist:
        color = filter(lambda x: x['rgb'] == obj, hist_dict_list)
        results.append(color[0])
    #print 'results: ', results
    return results


def _recode_transparency(image):
    """
    Gets an image RGBA
    Returns an RGB with (1, 2, 3) for background
    One px per color
    """
    # Get colors
    alist = image.getcolors(image.size[0] * image.size[1])
    blist = map(itemgetter(1), alist)

    # Remove alpha channel
    color_list_temp = map(lambda x: _code_transparent_rgb(x), blist)
    color_list_temp.sort(key=itemgetter(0), reverse=True)

    # Write new image with known background
    size = image.size
    image2 = Image.new('RGB', size, (1, 2, 3))
    image2.putdata(color_list_temp)
    #image2.show()

    return image2


def _code_transparent_rgb(num, rgba):
    if rgba[3] == 0:
        a = (1, 2, 3, 0)
        return a
    else:
        return rgba


def _histogram_image(image):
    """
    histogram returns a list (array) of pixel values 0-255.
    the indexes 0-255 RED 256-511 GREEN 512-768 BLUE
    """
    list = image.histogram()
    return list


def _color_histogram_image(image, n=5):
    """
    Get color returns a list of tuples with appearance and RGB
    """
    hist_list = image.getcolors(image.size[0] * image.size[1])
    hist_list.sort(key=itemgetter(0), reverse=True)
    if n < 0:
        n = len(hist_list)-2
    hist_list = hist_list[:n]

    # Construct a dictionary rgb:  hist:
    hist_dict_list = map(lambda x: {'rgb': x[1], 'hist': x[0]}, hist_list)
    return hist_dict_list


def find_dominate_colors(alist=[(255, 255, 0)], max_colors=10, snap_radius=SNAP_RADIUS):
    """

    """
    init_hue = alist[0]
    if not isinstance(init_hue, types.DictionaryType):
        init_hue['rgb'] = init_hue

    #init_family_polar = get_color_family_name_polar(init_hue[0], init_hue[1], init_hue[2])
    baseList = [init_hue, ]

    # Loop on hues in aList
    for i in range(1, len(alist)):

        # Break for max_colors in base line
        if len(baseList) > max_colors:
            break
        matches = 0

        # Loop on saved hues in baseList
        for j in range(0, len(baseList)):
            prev_hue = baseList[j]['rgb']
            hue = alist[i]['rgb']

            # Check if data is valid
            if isinstance(hue, types.DictionaryType):
                hue = hue['rgb']

            # Calculate min distance from other pointer and add a match
            distance = sqrt(sum((a-b)**2 for a, b in zip(prev_hue, hue)))

            # Check if we had that color family and light
            if distance > snap_radius:
                matches = matches+1
            else:
                continue

            if matches == len(baseList):
                baseList.append(alist[i])
                if len(baseList) > max_colors:
                    break

    return baseList


def show_image_with_strips(image, aList, bList):
    # size of a strip
    size = (image.size[0],100)
    imStrip = Image.new('RGB', size, (255, 255, 255))
    bg_w, bg_h = imStrip.size
    img_w = bg_w/len(bList)
    img_h = bg_h

    #add a strip to imString
    for i in range(0, len(bList)):
        offset1 = ((bg_w-img_w*(i+1)), 0)
        offset2 = ((bg_w-img_w*i), 0)
        strip1 = Image.new('RGB', (img_w, img_h), bList[i])
        strip2 = Image.new('RGB', (img_w, img_h), bList[i])
        imStrip.paste(strip1, offset1)
        imStrip.paste(strip2, offset2)

    # draw and add imStrip to image
    draw = ImageDraw.Draw(image)
    image.paste(imStrip, (0, 0))

    image.show()


def _remove_transparency_data(hist):
    # Remove (x, y, z, 0) from dominate colors
    blist = filter(lambda x: x['rgb'][3] > ALPHA_THRESHOLD, hist)

    # Remove alpha channel
    clist = map(lambda x: _remove_alpha(x), blist)

    return clist


def _remove_alpha(dict):
    rgba = dict['rgb']
    dict['rgb'] = rgba[0:3]
    return dict


def _remove_opaque_background(image, hist):
    ''' simple method based on intuition  that
     background is white or black
    '''

    # Sample corners
    alist = list(image.getdata())
    c0 = alist[0]
    c1 = alist[-1]

    # Remove corners' color or W/B
    white = (255, 255, 255)
    black = (0, 0, 0)
    if c0 == c1:
        if c0 == white:
            hist = _remove_color(hist, white, 8)
        elif c0 == black:
            hist = _remove_color(hist, black, 6)
        else:
            hist = _remove_color(hist, c0, 5)
    else:
        hist = _remove_color(hist, c0, 5)

    return hist


def draw_image_with_rgb(r, g, b, title='plot'):
    size = (200, 200)
    image = Image.new('RGB', size, (r, g, b))
    draw = ImageDraw.Draw(image)
    image.show('some', None)


def number_of_colors_in_image(image, hist_colors=None):
    """
    Input: image
    Output: Array of dictionaries {"name": "color_name", "percent": "number" }
    """
    if hist_colors is None:
        # Get histogram
        rect = (0, 0, image.size[0], image.size[1])
        hist_elements = (rect[2]-rect[0])*(rect[3]-rect[1])
        hist_colors = histogram_for_image(image, hist_elements)

    # Find color and light
    temp_dict = {}
    for color in hist_colors:
        rgb = color['rgb']
        hist_cnt = color['hist']

        # Find HSV and L values
        h, s, v = colorsys.rgb_to_hsv(rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0)
        h1, s1, l = colorsys.rgb_to_hls(rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0)
        h = h*360
        l = l*100
        s = s*100
        v = v*100

        # Find color family base on hsv/hsl
        color_base = color_match.find_family_color_for_h(h, s, v)

        # Find lightness
        color_light = color_match.find_color_light(l)

        '''
        # Using pre-defined color base and light
        colors = [rgb]
        hues = cm.hue_entries_for_rgb_list(colors, False)
        hue = hues[0]
        color_base = hue['family']
        color_light = hue['light']
        '''

        # Structure the result as a dictionary
        if color_base not in temp_dict:
            temp_dict[color_base] = {color_light: hist_cnt}
        else:
            if color_light not in temp_dict[color_base]:
                temp_dict[color_base][color_light] = hist_cnt
            else:
                temp_dict[color_base][color_light] = temp_dict[color_base][color_light] + hist_cnt

    # Normalize the values in the dictionary to 0-100
    #norm_dict = normilize_dictionary(temp_dict)
    return temp_dict, hist_colors


def normilize_dictionary(dict):
    """
    Find sum of values in the nested dictionary
    """
    m = 0
    for k, v in dict.items():
        if isinstance(v, types.DictionaryType):
            for k2, v2 in v.items():
                m = m + v2

    # Override dict with normal values
    norm = m
    s = 0
    result = {}
    for k, v in dict.items():
        if isinstance(v, types.DictionaryType):
            result[k] = dict[k]
            for k2, v2 in v.items():
                result[k][k2] = int(ceil((100.0*v2)/norm))

    return result


def _color_histogram_to_image(hist, size):
    alist = map(lambda x: x['rgb'], hist)
    image2 = Image.new('RGB', size, (1, 2, 3))
    image2.putdata(alist)
    image2.show()


def _remove_color(hist, rgb, delta):
    """
    Removes rgb +- delta permutations
    """
    hist1 = hist

    # Set start point for R
    startr = rgb[0]
    endr = startr + delta
    if rgb[0] > 100:
        startr = rgb[0] - delta
        endr = rgb[0] + 1

    for i in range(startr, endr):
        startg = rgb[1]
        endg = startg + delta
        if rgb[1] > 100:
            startg = rgb[1] - delta
            endg = rgb[1] + 1
        for j in range(startg, endg):
            startb = rgb[2]
            endb = startb + delta
            if rgb[2] > 100:
                startb = rgb[2] - delta
                endb = rgb[2] + 1
            for k in range(startb, endb):
                temp_rgb = (i, j, k)
                hist1 = filter(lambda x: x['rgb'] != temp_rgb, hist1)
    return hist1






'''
    Hue [0-1] radians 
    m = Min(r,g,b)
    M = Max(r,g,b)
    C = M-m           natural colors|C==0
    if M==r H=60*(G-B)/C
    if M==g H=60*(B-R)/C
    if M==b H=60*(R-G)/C
     Saturation = 0 if C==0; C/V else
     Value [0-1]
'''

