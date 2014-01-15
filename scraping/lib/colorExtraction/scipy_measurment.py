__author__ = 'Gshai'

import numpy as np
from scipy import ndimage
import matplotlib.pyplot as plt
import Image, ImageDraw


def PIL2array(img):
    if img.mode is 'RGBA':
        lvl = 4
    else:
        lvl = 3
    return np.array(img.getdata(),
                    np.uint8).reshape(img.size[1], img.size[0], lvl)


def array2PIL(arr, size):
    mode = 'RGBA'
    arr = arr.reshape(arr.shape[0]*arr.shape[1], arr.shape[2])
    if len(arr[0]) == 3:
        arr = np.c_[arr, 255 * np.ones((len(arr),1), np.uint8)]
    return Image.frombuffer(mode, size, arr.tostring(), 'raw', mode, 0, 1)


def get_boxes(n_labels, im_labels, im):
    # Calculate corners and center
    min_size = 10
    boxes = []
    for i in range(1, n_labels + 1):

        if len(im_labels.shape) == 2:
            py, px = np.nonzero(im_labels == i)
            #print 'py, px: ', py, px
            if len(py) < min_size:
                im[im_labels == i] = 0
                continue
            xmin, xmax, ymin, ymax = px.min(), px.max(), py.min(), py.max()

            # Four corners and centroid.
            boxes.append([
                [(xmin, ymin), (xmax, ymin), (xmax, ymax), (xmin, ymax)],
                (np.mean(px), np.mean(py))])

        elif len(im_labels.shape) == 3:
            py, px, pz  = np.nonzero(im_labels == i)
            if len(py) < min_size:
                im[im_labels == i] = 0
                continue
            if len(px) < min_size:
                im[im_labels == i] = 0
                continue
    return boxes


def flat_mask(mask):
    if len(mask.shape) == 2:
        return mask

    new_mask = np.empty_like(mask)
    if mask.shape[2] == 3:
        r, g, b = np.dsplit(mask, 3)
        y = r.shape[0]
        x = r.shape[1]
        r = r.reshape(y, x)
        g = g.reshape(y, x)
        b = b.reshape(y, x)
        new_mask = r | g | b

    elif mask.shape[2] == 4:
        r, g, b, a = np.dsplit(mask, 4)
        y = r.shape[0]
        x = r.shape[1]
        r = r.reshape(y, x)
        g = g.reshape(y, x)
        b = b.reshape(y, x)
        a = a.reshape(y, x)
        new_mask = r | g | b
        new_mask = new_mask & a

    print 'new_mask shape: ', new_mask.shape
    return new_mask


def color_breakdown(image):
    xsize, ysize = image.size
    image2 = image.convert('RGB')
    r, g, b = image2.split()
    rdata = r.getdata() # data is now an array of length ysize\*xsize
    gdata = g.getdata()
    bdata = b.getdata()

    # create numpy arrays
    npr = np.reshape(rdata, (ysize, xsize))
    npg = np.reshape(gdata, (ysize, xsize))
    npb = np.reshape(bdata, (ysize, xsize))

    return npr, npg, npb


def create_color_mask(im):

    # Sample corners
    a = im.shape
    if a[2] == 3:
        rgb = im[0, 0]
        rgb2 = im[a[0]-1, a[1]-1]
        print 'corner: ', rgb, rgb2
    elif a[2] == 4:
        rgba = im[0, 0]
        rgba2 = im[a[0]-1, a[1]-1]
        print 'corner: ', rgba, rgba2

    # Generate the mask
    print 'mean', im.mean()
    mask = im > im.mean()
    return mask


def main():

    # Read image RGB
    path = "/Users/Gshai/github/GAE/Extractor/Logos/"
    image_name = "Microsoft_Logo.png"
    full_path = path+image_name
    im_orig = Image.open(full_path)
    im = PIL2array(im_orig)
    print 'im.shape', im.shape

    # Color Mask path
    #color_breakdown(im_orig)

    # Read image grayscale
    im_g = ndimage.imread(full_path, True)
    im_gray = ndimage.morphology.grey_dilation(im_g, (3, 3)) - im_g

    # Create a color mask
    mask_c = create_color_mask(im)
    print 'mask_c', mask_c.shape

    # Flat a color mask
    mask_c_flat = flat_mask(mask_c)
    print 'mask_c_flat', mask_c_flat.shape

    # Create a Gray mask
    mask = im_gray > im_gray.mean()
    #print 'mask', mask.shape
    #print 'mask obj', mask[0]

    # Find labels from color mask
    label_im, nb_labels = ndimage.label(mask_c_flat)

    # Find labels from edge mask
    label_im_g, nb_labels_g = ndimage.label(mask)

    # Find boxes base on the labels
    my_boxes = get_boxes(nb_labels, label_im, im_gray)
    my_boxes_g = get_boxes(nb_labels_g, label_im_g, mask)

    # Draw perfect rectangles and the component centroid.
    visual = Image.fromarray(im)
    draw = ImageDraw.Draw(visual)

    visual2 = Image.fromarray(im)
    draw2 = ImageDraw.Draw(visual2)

    for b, centroid in my_boxes:
        draw.line(b + [b[0]], fill='yellow', width=3)
        cx, cy = centroid
        draw.ellipse((cx - 2, cy - 2, cx + 2, cy + 2), fill='red')

        #print centroid

    for b, centroid in my_boxes_g:
        draw2.line(b + [b[0]], fill='green', width=3)
        cx, cy = centroid
        draw2.ellipse((cx - 2, cy - 2, cx + 2, cy + 2), fill='red')

        # Crop sub images
        x0 = b[0][0]
        y0 = b[0][1]
        x1 = b[2][0]-1
        y1 = b[2][1]-1
        if x0 < x1 and y0 < y1:
            crop_im = visual.crop(box=(x0, y0, x1, y1))
            crop_im.show()

    visual.show()
    visual2.show()



    """
    plt.figure(figsize=(10, 4))
    plt.subplot(511)
    plt.imshow(im)
    plt.axis('off')
    plt.subplot(512)
    plt.imshow(mask, cmap=plt.cm.gray)
    plt.axis('off')
    plt.subplot(513)
    plt.imshow(im_gray, cmap=plt.cm.gray)
    plt.axis('off')
    plt.subplot(514)
    plt.imshow(label_im, cmap=plt.cm.spectral)
    plt.axis('off')
    plt.subplot(515)
    plt.imshow(mask_c_flat, cmap=plt.cm.gray)
    plt.axis('off')
    plt.subplots_adjust(wspace=0.02, hspace=0.02, top=1, bottom=0, left=0, right=1)

    """

main()