"""
Created on Jun 28, 2013

@author: gshai
"""
#import colorsys
import csv
import math
#from operator import is_not
#from functools import partial
import numpy as np

COLOR_NAMES_FILE_NAME = '/home/ec2-user/HueBrand/scraping/lib/colorExtraction/golden_units.csv'


class ColorMatch():
    def __init__(self):
        self.dictReader = list(csv.DictReader(open(COLOR_NAMES_FILE_NAME, 'rU'), fieldnames=['name', 'final_r', 'final_g', 'final_b', 'h', 's', 'v', 'l', 'family', 'light'], delimiter=','))

    def hue_entry_for_rgb_entry(self, rgb={'final_r': '153', 'final_g': '204', 'final_b': '102','name': 'Amethyst '}):
        """
        Parse RGB entry and find a HueEntry for it
        """
        r = int(rgb['final_r'])
        g = int(rgb['final_g'])
        b = int(rgb['final_b'])
        hue = self.hue_entry_for_rgb_euc(r, g, b)

        return hue

    def hue_entries_for_rgb_list(self, alist, isPolar=False):
        """
        receives a list of rgb an returns a list of Hue entries.
        default match is Euc. Alternative match is Polar.
        """
        hues = []
        for rgb in alist:
            if isPolar:
                # Don't support this
                print 'Not supported'
            else:
                hues.append(self.hue_entry_for_rgb_euc(rgb[0], rgb[1], rgb[2]))
        return hues

    def hue_entry_for_rgb_euc(self, r, g, b, delta=30):
        """
        hueEntryForRGB receives an r,g,b and compare it with
         all the Hue entries in the golden units.
         Returns an Hue Entry
        """
        a_arr = np.array([r, g, b])
        minDist = 1000
        minHue = None
        minHue2 = None
        hues = [i for i in self.dictReader if int(i['final_r'])-delta < r < int(i['final_r'])+delta and
                                              int(i['final_g'])-delta < g < int(i['final_g'])+delta and
                                            int(i['final_b'])-delta < b < int(i['final_b'])+delta]
        #print 'About to run :', len(hues), r, g, b
        for row in hues:
            b_arr = np.array((int(row['final_r']), int(row['final_g']), int(row['final_b'])))
            dist = dist_between_rgbs(a_arr, b_arr)

            # Euclidean distance
            if dist < minDist:
                minDist = dist
                if minHue:
                    minHue2 = minHue.copy()
                minHue = row

        #print 'We snap: {} {} {} to: {} {} {}'.format(r, g, b, minHue['final_r'], minHue['final_g'], minHue['final_b'])
        if minHue:
            minHue['sampled_r'] = r
            minHue['sampled_g'] = g
            minHue['sampled_b'] = b
            if minHue2:
                minHue['secondary_rgb'] = (minHue2['final_r'], minHue2['final_g'], minHue2['final_b'])
        return minHue


def get_nearest_neighbour(data, criteria):
    def sort_func(row):
        return distance(row, criteria)
    return data.index(min(data, key=sort_func))


def dist_between_np_rgbs(x, y):
    return np.sqrt(np.sum((x-y)**2))


def dist_between_rgbs(x, y):
    deltaX = y[0] - x[0]
    deltaY = y[1] - x[1]
    deltaZ = y[2] - x[2]
    dist = abs(deltaX) + abs(deltaY) + abs(deltaZ)
    return dist


def get_hsv_from_hue(hue):
    return float(hue['h']), float(hue['s']), float(hue['v'])


def distance(row_a, row_b):
    diffs = [math.fabs(a-b) for a, b in zip(row_a, row_b)]
    weights = (1, 1, 1)
    return sum([v*w for v,w in zip(diffs, weights)])


def remove_repeating_colors(colors):
    """
    itterate over hue objects and remove
    duplicate colors
    """
    #print 'remove colors: ', colors
    families = []
    results = []
    for color in colors:
        family = color['family']
        light = color['light']
        c = (family, light)
        if c not in families:
            families.append(c)
            results.append(color)

    #print 'cleaned colors: ', results
    return results


def find_color_light(l, rgb):
    if rgb > (248, 248, 248):
        return 'very light'
    light = ''
    if 0 <= l < 10:
        light = 'very dark'
    elif 10 <= l < 40:
        light = 'dark'
    elif 40 <= l < 70:
        light = 'medium'
    elif 70 <= l < 90:
        light = 'light'
    elif 90 <= l < 101:
        light = 'very light'
    return light


def find_family_color_for_h(h, s, v):
    #print 'h, s, v, l: ', h, s, v, l
    family = 'arrrr'

    # Find if we have Black or White
    if 0 <= s <= 5:
        if 0 <= v < 10:
            return 'black'
        elif 10 <= v < 95:
            return 'gray'
        else:
            return 'white'

    # Find color family base on Hue
    if 0 <= h < 82:

        # We first check for Brown and Beige which are special
        #brown_v = 65.839-0.312*h
        #beige_v = 93.767-0.169*h
        #beige_s = 37.383-0.1759*h
        #brown_s = 49.095-0.208*h
        #beige_l = 37.383-0.1759*h
        #brown_l = 65.839-0.312*h
        #print 'brown_v and s: ', brown_v, brown_s
        #print 'beige_v and s: ', beige_v, beige_s

        # Check Hue by value
        if 0 <= h < 16:
            family = 'red'

        elif 16 <= h < 46: # In the xls we see 10-55
            family = 'orange'
            if 40 < s < 60:
                #print 'brown 1'
                family = 'brown'
            elif 20 < s < 41:
                #print 'beige 1'
                family = 'beige'

        elif 46 <= h < 66: # In the xls we see 45-65
            family = 'yellow'
            if 40 < s < 50:
                #print 'brown 2'
                family = 'brown'
            elif 20 < s < 41:
                #print 'beige 2'
                family = 'beige'

        elif 66 <= h < 121:
            family = 'yellow/green'

    elif 66 <= h < 118:
        family = 'yellow/green'

    elif 118 <= h < 176:
        family = 'green'

    elif 176 <= h < 196:
        family = 'cyan'

    elif 196 <= h < 266:
        family = 'blue'

    elif 266 <= h < 296:
        family = 'purple'

    elif 296 <= h < 320:
        family = 'magenta'

    elif 320 <= h < 361:
        family = 'red'

    return family