import csv
import Image
import ImageDraw
#import images2gif
import json
import sys
import os
import numpy as np

import color_palette as cp
import color_match


SENSITIVITY = 30
MAX_COLORS = 5


def get_images_color_and_name_for_url_list(aList):
    for imageUrl in aList:
        get_images_color_and_name_for_url(imageUrl)


def get_images_color_and_name_for_url(url):
    imageColors, im = cp.histogram_for_url(url)
    if imageColors is not None:
        process_image_and_colors(im, imageColors)
    else:
        print 'ERROR - no imageColors'


def get_image_color_and_name_from_image_file(name):
    if name.endswith('gif'):
        frames = readGif(name, False)
        im = frames[0]
    else:
        im = Image.open(name)
    imageColors = cp.histogram_for_image_and_rect(im, 'all', MAX_COLORS, SENSITIVITY)
    if imageColors is not None:
        process_image_and_colors(im, imageColors)
    else:
        print 'ERROR - no imageColors'


def process_image_and_colors(image, colors):
    cm = color_match.ColorMatch()
    #print "----- Euc: ------"
    imageNames = cm.hue_entries_for_rgb_list(colors, False)
    #print "----- Polar: ------"
    imageNamesPolar = cm.hue_entries_for_rgb_list(colors, True)
    if imageNames is not None and imageNamesPolar is not None:
        #print imageNames, imageColors
        save_image_with_palette(imageNames, imageNamesPolar, colors, image)
        dictResults = {"images_from_euc": imageNames, "images_from_polar": imageNamesPolar}
        result = json.dumps(dictResults)
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
    size = (image.size[0], 50)
    bg = Image.new('RGB', size, (255, 255, 255))
    bg2 = Image.new('RGB', size, (255, 255, 255))
    bg_w, bg_h = size
    img_w = bg_w/len(colors)
    img_h = bg_h
    img2_w = bg_w/len(hues)
    if huesP:
        bg3 = Image.new('RGB', size, (255, 255, 255))
        img3_w = bg_w/len(huesP)

    for i in range(0, len(colors)):
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

    #image.show()
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
    path = "../Logos/"
    image_name = sys.argv[1];
    #image_name = 'CAT_Logo.jpg'
    full_path = path+image_name
    get_image_color_and_name_from_image_file(full_path)


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


main_file_exp()