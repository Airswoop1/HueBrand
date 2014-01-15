__author__ = 'Gshai'

import numpy as np
#from scipy.cluster.vq import kmeans, vq

def color_quantization(img, n_colors=10):
    """
        input @img is an nparray
        output nparray
    """

    # reshaping the pixels matrix
    d = img.shape[2]
    pixel = np.reshape(img, (img.shape[0]*img.shape[1], d))

    # performing the clustering
    centroids, _ = kmeans(pixel, n_colors)
    #print 'centroids: ', centroids

    # quantization
    qnt, _ = vq(pixel, centroids)

    # reshaping the result of the quantization
    centers_idx = np.reshape(qnt, (img.shape[0], img.shape[1]))
    clustered = centroids[centers_idx]
    return clustered
