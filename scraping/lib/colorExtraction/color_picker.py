"""
Author Gilad Shai
email spotted.rhino.inc@gmail.com
"""

import Image
import ImageDraw

from StringIO import StringIO
import urllib

import sys
import operator
import types
from operator import itemgetter
from math import sqrt
#import colorsys
from itertools import groupby
#import face_detection

RECT = (0,0,100,100)
BOX_WIDTH = 40
BOX_HEIGHT = 40
H_MARGIN = 100
FILTER_MODE = 10
HIST_ELEMENTS = 100
DEBUG = True
DISTINCT_RADIUS = 	50
MAX_HUES_IN_LIST = 3


def fetchImageFromURL(url):
    """ fetches image from url"""
    try:
        img = Image.open(StringIO(urllib.urlopen(url).read()))
        return img
    except:
        print 'Error - fail to read image from: '+str(url)
        return None


def histogramFromImage(im):
    """ set area to sample colors from the image """
    downImList = None
    if im is None:
        print 'Error - did not fetch image from url: '+str(url)
        return None
    
    rect = (im.size[0]/2-BOX_WIDTH, im.size[1]/2-BOX_HEIGTH-H_MARGINE, im.size[0]/2 + BOX_WIDTH, im.size[1]/2+BOX_HEIGTH-H_MARGINE)
    #rects = face_detection.detect(im)
    #rect = face_detection.adjustRects(im, rects)
    upImList = histogramFromImageWithRect(im, rect)
    
    if upImList is None:
        print 'Error - histogram is empty with rect: '+str(rect)        
        return None        

    return upImList, im
    

def histogramFromImageWithRect(image, rect = RECT) :
    """ Starting point. receives image and rect to crop
        and create a histogram/color pallete.
        Returns a list of snapped colors (tuples)
    """
    # crop sampling area
    thumb = _crop_image(image, rect)
    
    if thumb is None:
        print 'Error - return None for thumb'
        return None  

    # get dominate colors
    aList = _colorHistogramImage(thumb, HIST_ELEMENTS)
    
    # generate image from dominate colors
    bList = shortColorList(aList,(1000,100))
    print 'short list:', bList
    if not isinstance(bList[0], types.TupleType):
        return None
    if DEBUG:
        size = (image.size[0],100)
        bg = Image.new('RGB', size, (255,255,255))     
        bg_w,bg_h = bg.size
        img_w = bg_w/len(bList)
        img_h = bg_h
        
        # add a strip
        for i in range(0, len(bList)):
            offset = ((bg_w-img_w*(i+1)), 0)
            strip = Image.new('RGB', (img_w,img_h), bList[i])
            strip2 = Image.new('RGB', (img_w,img_h), bList[i])
            bg.paste(strip, offset)        
        draw = ImageDraw.Draw(image)
        draw.rectangle(rect, outline=200) 
        image.paste(bg, (0,image.size[1]-100))
        
        image.show()
        #fileName = 'RGBs_'
        #for tup in bList:
        #	fileName = fileName + str(tup)
        #fileName = fileName+'_a.jpg'
        #image.save(fileName)
        #thumbMode.show()
        
    return bList


def _crop_image(image, rect):
    try:
        thumb = image.crop(rect)
    except:
        return None    
    return thumb


def _color_histogram_image(image, n=3):
    """returns a list of tuples with appearance and RGB"""
    alist = image.getcolors(image.size[0] * image.size[1])        
    alist.sort(key=itemgetter(0), reverse=True)
    if n < 0:
        n = len(alist)-2
    colorList = map(itemgetter(1), alist[:n])    
    return colorList


def short_color_list(alist=[(255,255,0)], size=(100,100)):
    """ loops over hues and return a short list of colors
    limited by MAX_HUES_IN_LIST.
    We pick colors with in a radius of DISTINCT_RADIUS.
    If Debug is ON - create """

    baseList = [alist[0],]
# Loop on hues in aList
    for i in range(1, len(alist)):
        if len(baseList) > MAX_HUES_IN_LIST :
            break
        matches = 0        
        
        # Loop on saved hues in baseList
        for hue in baseList:
            if not isinstance(hue, types.TupleType):
                print 'ERROR - not Tuple'
                break

            # save color to list if it is far enough
            # consider to add a polar distance condition
            distance = sqrt(sum((a-b)**2 for a,b in zip(hue, alist[i])))                        
            if distance > DISTINCT_RADIUS:
                matches = matches+1
            else:
                continue
                
            if matches == len(baseList):
                baseList.append(alist[i])
                if len(baseList)>4 :
                    break    

    return baseList 


def main(argv):
    #print argv[1]    
    #image = Image.open('RGBs_white_gray_(235, 238, 245)(38, 40, 55)_a.jpg')
    image = Image.open('RGBs_gray_gray_brown_gray_(187, 184, 179)(155, 150, 146)(74, 69, 66)(108, 100, 97)_a.jpg')
    colors = histogramFromImage(image)
    

if __name__ == "__main__":
    main(sys.argv)

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
