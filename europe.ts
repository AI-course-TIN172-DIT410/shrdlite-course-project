﻿///<reference path="Graph.ts"/>

module Europe {
    export var Nodes: PointNode[] = [
        new PointNode('Albania',                  324, 426 ),
        new PointNode('Andorra',                  133, 408 ),
        new PointNode('Austria',                  260, 344 ),
        new PointNode('Belarus',                  360, 244 ),
        new PointNode('Belgium',                  171, 299 ),
        new PointNode('Bosnia and Herzegovina',   297, 388 ),
        new PointNode('Bulgaria',                 371, 397 ),
        new PointNode('Croatia',                  276, 370 ),
        new PointNode('Czech Republic',           265, 312 ),
        new PointNode('Denmark',                  215, 227 ),
        new PointNode('Estonia',                  331, 179 ),
        new PointNode('Finland',                  307, 147 ),
        new PointNode('France',                   147, 352 ),
        new PointNode('Germany',                  220, 293 ),
        new PointNode('Greece',                   345, 442 ),
        new PointNode('Hungary',                  305, 346 ),
        new PointNode('Ireland',                   73, 249 ),
        new PointNode('Island',                    57,  73 ),
        new PointNode('Italy',                    225, 377 ),
        new PointNode('Kaliningrad Oblast',       309, 238 ),
        new PointNode('Kosovo',                   329, 405 ),
        new PointNode('Latvia',                   328, 205 ),
        new PointNode('Liechtenstein',            215, 351 ),
        new PointNode('Lithuania',                327, 225 ),
        new PointNode('Luxembourg',               184, 314 ),
        new PointNode('Moldova',                  391, 327 ),
        new PointNode('Monaco',                   192, 397 ),
        new PointNode('Montenegro',               312, 405 ),
        new PointNode('Netherlands',              179, 280 ),
        new PointNode('Norway',                   218, 170 ),
        new PointNode('Poland',                   306, 276 ),
        new PointNode('Portugal',                  27, 430 ),
        new PointNode('Republic of Macedonia',    339, 415 ),
        new PointNode('Romania',                  360, 352 ),
        new PointNode('San Marino',               244, 394 ),
        new PointNode('Serbia',                   324, 384 ),
        new PointNode('Slovakia',                 306, 323 ),
        new PointNode('Slovenia',                 265, 363 ),
        new PointNode('Spain',                     73, 430 ),
        new PointNode('Sweden',                   251, 196 ),
        new PointNode('Switzerland',              200, 353 ),
        new PointNode('Ukraine',                  371, 294 ),
        new PointNode('United Kingdom',           122, 267 ),
        new PointNode('Vatican City',             242, 421 )
    ];

    export var Edges: [number, number][][] = [
        [[ 0, 32], [ 0, 14], [ 0, 27], [ 0, 20]],
        [[ 1, 12], [ 1, 38]],
        [[ 2, 13], [ 2,  8], [ 2, 36], [ 2, 15], [ 2, 37], [ 2, 18], [ 2, 40], [ 2, 22]],
        [[ 3, 30], [ 3, 21], [ 3, 23], [ 3, 41]],
        [[ 4, 28], [ 4, 24], [ 4, 13], [ 4, 12]],
        [[ 5,  7], [ 5, 35], [ 5, 27]],
        [[ 6, 33], [ 6, 32], [ 6, 14], [ 6, 35]],
        [[ 7,  5], [ 7, 37], [ 7, 15], [ 7, 35], [ 7, 27]],
        [[ 8, 13], [ 8, 30], [ 8, 36], [ 8, 2]],
        [[ 9, 13], [ 9, 39]],
        [[10, 21]],
        [[11, 39], [11, 29]],
        [[12,  4], [12, 13], [12, 24], [12, 40], [12, 18], [12, 26], [12, 38], [12,  1], [12, 42]],
        [[13, 12], [13,  4], [13, 28], [13, 24], [13,  9], [13, 30], [13,  8], [13,  2], [13, 40]],
        [[14,  0], [14, 32], [14,  6]],
        [[15,  2], [15, 36], [15, 41], [15, 33], [15, 35], [15, 7], [15, 37]],
        [[16, 42]],
        [[17, 29], [17, 42]],
        [[18, 12], [18, 40], [18, 34], [18,  2], [18, 37], [18, 43]],
        [[19, 30], [19, 23]],
        [[20, 27], [20, 35], [20, 32], [20,  0]],
        [[21, 10], [21,  3], [21, 23]],
        [[22, 40], [22,  2]],
        [[23, 21], [23,  3], [23, 19], [23, 30]],
        [[24, 12], [24,  4], [24, 13]],
        [[25, 33], [25, 41]],
        [[26, 12]],
        [[27,  7], [27,  5], [27, 35], [27, 20], [27,  0], [27, 35]],
        [[28,  4], [28, 13]],
        [[29, 11], [29, 39], [29, 17]],
        [[30, 19], [30, 23], [30,  3], [30, 41], [30,  8], [30, 36], [30, 13]],
        [[31, 38]],
        [[32,  0], [32,  6], [32, 14], [32, 20], [32,35]],
        [[33, 15], [33,  6], [33, 41], [33, 25], [33, 35]],
        [[34, 18]],
        [[35,  5], [35,  7], [35, 15], [35, 33], [35, 6], [35, 32], [35, 20], [35, 27]],
        [[36, 30], [36,  8], [36, 15], [36,  2], [36, 41]],
        [[37,  2], [37, 15], [37,  7], [37, 18]],
        [[38, 31], [38, 12], [38,  1]],
        [[39, 29], [39, 11], [39,  9]],
        [[40, 12], [40, 13], [40,  2], [40, 18], [40, 22]],
        [[41, 30], [41,  3], [41, 15], [41, 36], [41, 25], [41, 33]],
        [[42, 16], [42, 12], [42, 17]],
        [[43, 18]]
    ];
}