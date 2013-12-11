# Author Gilad Shai
# email spotted.rhino.inc@gmail.com
# url http://spottedrhino.com

import Image
import ImageDraw
from StringIO import StringIO
import urllib
import sys
import operator
import types
from operator import itemgetter
from math import sqrt
import colorsys
from itertools import groupby

import color_match

RECT = (0, 0, 100, 100)
BOX_WIDTH = 40
BOX_HEIGHT = 40
H_MARGIN = 100
FILTER_MODE = 10
HIST_ELEMENTS = BOX_WIDTH*BOX_HEIGHT
DEBUG = False
SNAP_RADIUS = 50


def fetch(url):
    try:
        img = Image.open(StringIO(urllib.urlopen(url).read()))                
    except:
        print 'Error - fail to read image from: '+str(url)
        return None
    return img


def histogram_for_url(url):
    
    im = fetch(url)
    if im is None:
        print 'Error - did not fetch image from url: '+str(url)
        return None
    
    rect = (im.size[0]/2-BOX_WIDTH, im.size[1]/2-BOX_HEIGHT-H_MARGIN, im.size[0]/2 + BOX_WIDTH, im.size[1]/2+BOX_HEIGHT-H_MARGIN)
    #rects = face_detection.detect(im)
    #rect = face_detection.adjustRects(im, rects)
    upImList = histogram_for_image_and_rect(im, rect, 5)
    
    if upImList is None:
        print 'Error - histogram is empty with rect: '+str(rect)        
        return None        
    #rectDown = (im.size[0]/2-BOX_WIDTH, im.size[1]/2+H_MARGINE, im.size[0]/2 + BOX_WIDTH, im.size[1]/2+2*H_MARGINE)
    #downImList = histogram_for_image_and_rect(im, rectDown)    
    #imagesColorLists = [upImList, downImList] 
    #print 'color lists for Top and Bottom: \n', upImList    
    
    return upImList, im
    

def _crop_image(image, rect):
    try:
        thumb = image.crop(rect)
    except:
        return None
    
    return thumb


def histogram_for_image_and_rect(image, rect=RECT, max_colors=10, snap_radius=SNAP_RADIUS):
    """
    Starting point. receives image and rect to crop
        and create a histogram/color palette
    """
    # Handle transparency if needed
    if image.mode == 'RGBA':
        image = _recode_transparency(image)

    if rect is None:
        rect = (image.size[0]/2-BOX_WIDTH, image.size[1]/2-BOX_HEIGHT-H_MARGIN, image.size[0]/2 + BOX_WIDTH, image.size[1]/2+BOX_HEIGHT-H_MARGIN)
    if rect == 'all':
        rect = (0, 0, image.size[0], image.size[1])
        thumb = image
    else:
        thumb = _crop_image(image, rect)
    
    if thumb is None:
        print 'Error - return None for thumb'
        return None  
    #thumbSmoth = thumb.filter(ImageFilter.SMOOTH)
    #thumbMode = thumbSmoth.filter(ImageFilter.ModeFilter(FILTER_MODE))    

    # Get dominate colors
    hist_elements = (rect[2]-rect[0])*(rect[3]-rect[1])
    hist_colors = _color_histogram_image(thumb, hist_elements)

    # Remove (1, 2, 3) from dominate colors
    hist_colors = filter(lambda x: x != (1, 2, 3), hist_colors)

    # Generate image from dominate colors
    bList = find_dominate_colors(hist_colors, max_colors, snap_radius)
    #print 'dominate colors: ', bList
    if not isinstance(bList[0], types.TupleType):
        return None

    return bList


def _recode_transparency(image):
    alist = image.getcolors(image.size[0] * image.size[1])
    blist = map(itemgetter(1), alist)
    colorList_T = map(lambda x: _code_transparent_rgb(x), blist)
    colorList_T.sort(key=itemgetter(0), reverse=True)
    size = image.size
    image2 = Image.new('RGB', size, (1, 2, 3))
    image2.putdata(colorList_T)
    return image2


def _code_transparent_rgb(rgba):
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
    get color returns a list of tuples with appearance and RGB
    """
    alist = image.getcolors(image.size[0] * image.size[1])
    alist.sort(key=itemgetter(0), reverse=True)
    #print "histogram : ", alist
    #print "len(histogram) : ", len(alist)
    if n < 0:
        n = len(alist)-2
    colorList = map(itemgetter(1), alist[:n])

    # Remove elements with 0 transparency
    #colorList_T = filter(lambda x: x[0] > 1, colorList)
    return colorList


def find_dominate_colors(alist=[(255,255,0)], max_colors=10, snap_radius=SNAP_RADIUS):
    cm = color_match.ColorMatch()

    init_hue = alist[0]
    init_family_polar = get_color_family_name_polar(init_hue[0], init_hue[1], init_hue[2])
    baseList = [init_hue, ]
    colorFamilies = [init_family_polar, ]

    # Loop on hues in aList
    for i in range(1, len(alist)):

        # Break for max_colors in base line
        if len(baseList) > max_colors:
            break
        matches = 0

        # Loop on saved hues in baseList
        for j in range(0, len(baseList)):
            prev_hue = baseList[j]
            #prev_family = colorFamilies[j]
            hue = alist[i]
            #print 'prev_family: ', prev_family

            # Check if data is valid
            if not isinstance(hue, types.TupleType):
                print 'ERROR - not Tuple'
                break

            # Calculate min distance from other pointer and add a match
            distance = sqrt(sum((a-b)**2 for a, b in zip(prev_hue, hue)))

            # Check if we had that color family and light
            #family_polar = get_color_family_name_polar(hue[0], hue[1], hue[2])
            #print 'hue + family: ', hue, family_polar

            if (distance > snap_radius):
                matches = matches+1
            else:
                continue

            if matches == len(baseList):
                baseList.append(alist[i])
                #colorFamilies.append(family_polar)
                if len(baseList) > max_colors:
                    break

    return baseList


def get_color_family_name_polar(r, g, b):
    h, s, v = rgb_to_hsv(r, g, b)
    cm = color_match.ColorMatch()
    family_polar, si, ei = cm.find_family_color_and_interval_for_h(h)
    return family_polar


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
    #draw = ImageDraw.Draw(image)
    #image.paste(imStrip, (0, 0))

    #image.show()


def _remove_transparency_data(alist):
    blist = map(lambda row: row[0] > 0, alist)
    return blist


def _color_exp():
    size = (1000,100)
    bg = Image.new('RGB', size, (0, 255, 0))
    bg_w, bg_h = bg.size
    img_w = bg_w/255
    img_h = bg_h    

    for i in range(1, 255):
        offset = ((bg_w-img_w*i), 0)
        offset2 = ((bg_w-img_w*i), 50)
        hsv = colorsys.rgb_to_hsv(i, 100, 100)
        strip1 = Image.new('RGB', (img_w,img_h/2), (i, 100, 100))
#         strip2 = Image.new('RGB', (img_w,img_h/2), colorsys.hsv_to_rgb(hsv[0], hsv[1], hsv[2]))
        rgb = hsvToRGB(hsv[0], hsv[1], hsv[2])
        rgb1 = (int(rgb[0]), int(rgb[1]), int(rgb[2]))
        strip2 = Image.new('RGB', (img_w,img_h/2), rgb1)
        bg.paste(strip1, offset)
        bg.paste(strip2, offset2)
    #bg.show()


def hsv_to_rgb(h, s, v):
    """
    Convert HSV color space to RGB color space
    @param h: Hue
    @param s: Saturation
    @param v: Value
    return (r, g, b)  
    """
    import math
    hi = math.floor(h / 60.0) % 6
    f =  (h / 60.0) - math.floor(h / 60.0)
    p = v * (1.0 - s)
    q = v * (1.0 - (f*s))
    t = v * (1.0 - ((1.0 - f) * s))
    return {
        0: (v, t, p),
        1: (q, v, p),
        2: (p, v, t),
        3: (p, q, v),
        4: (t, p, v),
        5: (v, p, q),
    }[hi]


def rgb_to_hsv(r, g, b):
    """
    Convert RGB color space to HSV color space
    @param r: Red
    @param g: Green
    @param b: Blue
    return (h, s, v)  
    """
    maxc = max(r, g, b)
    minc = min(r, g, b)
    colorMap = {
        id(r): 'r',
        id(g): 'g',
        id(b): 'b'
    }
    if colorMap[id(maxc)] == colorMap[id(minc)]:
        h = 0
    elif colorMap[id(maxc)] == 'r':
        h = 60.0 * ((g - b) / (maxc - minc)) % 360.0
    elif colorMap[id(maxc)] == 'g':
        h = 60.0 * ((b - r) / (maxc - minc)) + 120.0
    elif colorMap[id(maxc)] == 'b':
        h = 60.0 * ((r - g) / (maxc - minc)) + 240.0
    v = maxc
    if maxc == 0.0:
        s = 0.0
    else:
        s = 1.0 - (minc / maxc)
    return (h, s, v)        


def draw_image_with_rgb(r, g, b, title='plot'):
    size = (200, 200)
    image = Image.new('RGB', size, (r, g, b))
    #draw = ImageDraw.Draw(image)
    #image.show('some', None)






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

