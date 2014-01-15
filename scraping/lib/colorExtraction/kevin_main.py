import os
import csv
import logging
import Image
import ImageDraw
#from svglib.svglib import svg2rlg
#import pysvg
import json
import numpy as np
#from reportlab.graphics import renderPM
import color_quantization as cq
import sys


import color_palette as cp
import color_match

SENSITIVITY = 50
MAX_COLORS = 6


def readGif(filename, asNumpy=True):
    """ readGif(filename, asNumpy=True)

    Read images from an animated GIF file.  Returns a list of numpy
    arrays, or, if asNumpy is false, a list if PIL images.

    """

    # Check Numpy
    if np is None:
        raise RuntimeError("Need Numpy to read animated gif files.")

    # Check whether it exists
    if not os.path.isfile(filename):
        raise IOError('File not found: '+str(filename))

    # Load file using PIL
    pilIm = Image.open(filename)
    pilIm.seek(0)

    # Read all images inside
    images = []
    try:
        while True:
            # Get image as numpy array
            tmp = pilIm.convert() # Make without palette
            a = np.asarray(tmp)
            if len(a.shape)==0:
                raise MemoryError("Too little memory to convert PIL image to array")
            # Store, and next
            images.append(a)
            pilIm.seek(pilIm.tell()+1)
    except EOFError:
        pass

    # Convert to normal PIL images if needed
    if not asNumpy:
        images2 = images
        images = []
        for index,im in enumerate(images2):
            tmp = Image.fromarray(im)
            images.append(tmp)

    # Done
    return images


def get_images_color_and_name_for_url_list(aList):
    for imageUrl in aList:
        get_images_color_and_name_for_url(imageUrl)


def get_images_color_and_name_for_url(url):
    imageColors, im = cp.histogram_for_url(url)
    if imageColors is not None:
        process_image_and_colors(im, imageColors)
    else:
        print 'ERROR - no imageColors'


def get_image_by_name(name):
    if name.endswith('gif'):
        frames = readGif(name, False)
        im = frames[0]
    elif name.endswith('svg'):
        logging.info('I DO NOT SUPPORT SVG AT THIS POINT')
        im = None
    else:
        im = Image.open(name)

    if im.mode != 'RGBA':
        #print 'not RGBA'
        if im.mode != 'RGB':
            #print 'not RGB'
            im = im.convert('RGB')

    return im


def quantize_image(image, n_colors=6):
    np_array = np.array(image)
    im_q = cq.color_quantization(np_array, n_colors)
    #print im_q.dtype
    if im_q.dtype == 'float64':
        im_q = im_q.dot(255)
        im_q = im_q.astype(np.uint8)

    im_array = Image.fromarray(im_q)
    return im_array


def get_image_color_and_name_from_image_file(name):

    # Load image to RGB or RGBA
    im = get_image_by_name(name)

    # Quantize the image
    #im_q = quantize_image(im, 4)

    # Find complete color composition
    color_composition, hist = cp.number_of_colors_in_image(im)
    #print "color_composition: ", len(color_composition), color_composition

    hist_dict_list = cp.get_dominate_colors_from_hist(im, hist, MAX_COLORS, SENSITIVITY)

    if hist_dict_list is not None:
        process_image_and_colors(im, hist_dict_list, color_composition)
        #print 'hist_dict_list:', hist_dict_list
    else:
        print 'ERROR - no imageColors'


def process_image_and_colors(image, colors_dict=None, color_composition=None):
    cm = color_match.ColorMatch()
    colors = map(lambda x: x['rgb'], colors_dict)
    hue_objs = cm.hue_entries_for_rgb_list(colors, False)
    hue_objs_clean = cm.remove_repeating_colors(hue_objs)
    #print 'hue_objs_clean: ', len(hue_objs), hue_objs
    if hue_objs_clean is not None :
        #save_image_with_palette(hue_objs_clean, None, colors, image)
        dict_results = {"images_from_euc": hue_objs_clean, "color_composition": color_composition}
        result = json.dumps(dict_results)
        print result
    else:
        print 'Error - no imageNames'


def save_image_with_palette(hues, huesP=None, colors=None, image=None, bSave=None):
    """
    add strips:
    strip - sampled color
    strip2 - Euc match
    strip3 - Polar match, if HueP
    """
    if image is None:
        print 'Do not have image to save'
        return
    num_of_colors = min(len(hues), len(colors))
    size = (image.size[0], 50)
    bg = Image.new('RGB', size, (255, 255, 255))
    bg2 = Image.new('RGB', size, (255, 255, 255))
    bg_w, bg_h = size
    img_w = bg_w/num_of_colors
    img_h = bg_h
    img2_w = bg_w/num_of_colors
    if huesP:
        bg3 = Image.new('RGB', size, (255, 255, 255))
        img3_w = bg_w/num_of_colors

    for i in range(0, num_of_colors):
        offset = ((bg_w-img_w*(i+1)), 0)
        strip = Image.new('RGB', (img_w, img_h), colors[i])
        draw = ImageDraw.Draw(strip)
        draw.text((5, 20), str(colors[i]))
        bg.paste(strip, offset)
        hue = hues[i]
        strip2 = Image.new('RGB', (img2_w, img_h), (int(hue['final_r']), int(hue['final_g']), int(hue['final_b'])) )
        draw2 = ImageDraw.Draw(strip2)

        h, s, v, l = round(float(hue['h'])), round(float(hue['s'])), round(float(hue['v'])), round(float(hue['l']))
        if l > 70.0:
            draw2.text((5, 5), hue['family'], 255)
            draw2.text((5, 20), str(hue['final_r']+' '+hue['final_g']+' '+hue['final_b']), 255)
            draw2.text((5, 35), str(h)+' '+str(s)+' '+str(v)+' '+str(l), 255)
        else :
            draw2.text((5, 5), hue['family'])
            draw2.text((5, 20), str(hue['final_r']+' '+hue['final_g']+' '+hue['final_b']))
            draw2.text((5, 35), str(h)+' '+str(s)+' '+str(v)+' '+str(l))
        bg2.paste(strip2, offset)

        if huesP is not None:
            hueP = huesP[i]
            strip3 = Image.new('RGB', (img3_w, img_h), (int(hueP['final_r']), int(hueP['final_g']), int(hueP['final_b'])))
            draw3 = ImageDraw.Draw(strip3)
            h, s, v, l = round(float(hueP['h'])), round(float(hueP['s'])), round(float(hueP['v'])), round(float(hueP['l']))
            if l > 70:
                draw3.text((5, 5), hueP['family'], 255)
                draw3.text((5, 20), str(hueP['final_r']+' '+hueP['final_g']+' '+hueP['final_b']), 255)
                draw3.text((5, 35), str(h)+' '+str(s)+' '+str(v)+' '+str(l), 255)
            else:
                draw3.text((5, 5), hueP['family'])
                draw3.text((5, 20), str(hueP['final_r']+' '+hueP['final_g']+' '+hueP['final_b']))
                draw3.text((5, 35), str(h)+' '+str(s)+' '+str(v)+' '+str(l))
            bg3.paste(strip3, offset)

    draw = ImageDraw.Draw(image)
    image.paste(bg, (0,image.size[1]-55))
    image.paste(bg2, (0,image.size[1]-110))
    if huesP is not None:
        image.paste(bg3, (0,image.size[1]-165))

    image.show()
    if bSave:
        fileName = 'RGBs_'
        for name in names:
            fileName = fileName + str(name['family'])+'_'
        for tup in colors:
            fileName = fileName + str(tup)
        fileName = fileName+'_a.jpg'
        image.save(fileName)


def main_url_exp():
    """
    get a list of image urls from colorOutput_HSL_1
    and process them.
    """
    listOfRows = list(csv.DictReader(open('kevin_list_of_url_for_testing.csv', 'rU'), fieldnames=['url'], delimiter = ','))
    imageList  = map(lambda row: row['url'], listOfRows)
    get_images_color_and_name_for_url_list(imageList[1:2])


def main_file_exp():
    """
    shows image with sampled and snapped strips
    """
    path = "/Users/airswoop1/CAUS/Development/HueBrand/application/public/logos/"
    image_name = sys.argv[1];
    #image_name = 'CAT_Logo.jpg'
    #image_name = 'a.gif'
    #image_name = 'svg.svg'
    #image_name = 'anheuser_busch.png'
    #image_name = 'class_cnbc.png'
    #image_name = 'vox.png'
    #image_name = 'Rio_Tinto.jpg'
    #image_name = '3M_Logo.png'
    #image_name = 'Google_Logo.jpg'
    #image_name = 'petrochina.png'
    #image_name = 'im10.jpg'
    #image_name = 'test1.jpg'
    full_path = path+image_name

    get_image_color_and_name_from_image_file(full_path)


main_file_exp()