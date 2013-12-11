"""
Created on Jun 28, 2013

@author: gshai
"""
import colorsys
import csv
import sys
import  math
from operator import is_not
from functools import partial

COLOR_NAMES_FILE_NAME = './lib/colorExtraction/golden_units.csv'


class ColorMatch():
    def __init__(self):
        self.dictReader = list(csv.DictReader(open(COLOR_NAMES_FILE_NAME, 'rU'), fieldnames=['name', 'final_r', 'final_g', 'final_b', 'h', 's', 'v','l','family', 'light'], delimiter=','))
        self.ei = 0
        self.si = 0

    def hue_entry_for_rgb_entry(self, rgb = {'final_r': '153', 'final_g': '204', 'final_b': '102','name': 'Amethyst '}):
        """
        Parse RGB entry and find a HueEntry for it
        """
        r = int(rgb['final_r'])
        g = int(rgb['final_g'])
        b = int(rgb['final_b'])
        hue = hueEntryForRGBEuc(r,g,b)
        print 'we are looking for: ', str(r), str(g), str(b)
        print 'we found: ', hue
        print '-------\n'
        return hue

    def hue_entries_for_rgb_list(self, alist, isPolar=False):
        """
        receives a list of rgb an returns a list of Hue entries.
        default match is Euc. Alternative match is Polar.
        """
        hues = []
        for rgb in alist:
            if isPolar:
                hues.append(self.hue_entry_for_rgb_polar(rgb[0], rgb[1], rgb[2]))
            else:
                hues.append(self.hue_entry_for_rgb_euc(rgb[0], rgb[1], rgb[2]))
        return hues

    def hue_entry_for_rgb_euc(self, r, g, b):
        """
        hueEntryForRGB receives an r,g,b and compare it with
         all the Hue entries in the golden units.
         Returns an Hue Entry
        """
        minDist = 1000
        dist1 = None
        for row in self.dictReader:
            deltaX = int(row['final_r']) - r
            deltaY = int(row['final_g']) - g
            deltaZ = int(row['final_b']) - b

            # Euclidean distance
            dist1 = abs(deltaX) + abs(deltaY) + abs(deltaZ)
            if dist1 < minDist:
                minDist = dist1
                minHue = row
        #print 'We snap: {} {} {} to: {} {} {}'.format(r,g,b, minHue['final_r'], minHue['final_g'],minHue['final_b'])
        return minHue

    def hue_entry_for_rgb_polar(self, r, g, b):
        """
        hue_entry_for_rgb_polar receives an r,g,b and compare it with
         all the Hue entries in the golden units.
         Returns an Hue Entry
        """
        h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
        h = h*360
        s = s*100
        v = v*100

        # Find family color in range of H
        family, si, ei = self.find_family_color_and_interval_for_h(h)
        #print 'selected family: ', family
        self.ei = ei
        self.si = si

        # Find colors in range
        colorsInRange = map(lambda row: self.find_colors_in_range(row), self.dictReader)

        # Remove empty results
        colorsInRange = filter(partial(is_not, None), colorsInRange)
        #print 'number of hues: ', len(colorsInRange)

        # Find the closest v value
        tuples = map(lambda row: self.get_hsv_from_hue(row), colorsInRange)
        idx = self.get_nearest_neighbour(tuples, (h,s,v))
        newHSV = colorsInRange[idx]
        return newHSV

    def find_family_color_and_interval_for_h(self, h):
        family = ''
        si = 0
        ei = 0

        """ Find color family base on Hue """
        if h >= 0 and h < 16 :
            family = 'red'
            si = 0
            ei = 15
        elif h>=16 and h<46:
            family = 'orange'
            si = 16
            ei = 45
        elif h>=46 and h<66:
            family = 'yellow'
            si = 46
            ei = 65
        elif h>=66 and h<121:
            family = 'yellow/green'
            si = 66
            ei = 120
        elif h>=121 and h<176:
            family = 'green'
            si = 121
            ei = 175
        elif h>=176 and h<196:
            family = 'cyan'
            si = 176
            ei = 195
        elif h>=196 and h<266:
            family = 'blue'
            si = 196
            ei = 265
        elif h>=266 and h<296:
            family = 'purple'
            si = 266
            ei = 295
        elif h>=296 and h<320:
            family = 'magenta'
            si = 296
            ei = 319
        elif h>=320 and h<361:
            family = 'red'
            si = 320
            ei = 360

        return family, si, ei

    def find_colors_in_range(self, hue):
        h = float(hue['h'])
        #print 'h: ', h, self.si, self.ei
        if h >= self.si and h <= self.ei:
            return hue

    def get_hsv_from_hue(self, hue):
        return (float(hue['h']), float(hue['s']), float(hue['v']))

    def distance(self, row_a, row_b):
        diffs = [math.fabs(a-b) for a,b in zip(row_a, row_b)]
        weights = (1,1,1)
        return sum([v*w for v,w in zip(diffs, weights)])

    def get_nearest_neighbour(self, data, criteria):
        def sort_func(row):
            return self.distance(row, criteria)
        return data.index(min(data, key=sort_func))