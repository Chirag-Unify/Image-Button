"use strict";
var _a;
var _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// Read Figma JSON
var figmaData = JSON.parse(fs.readFileSync('figma.json', 'utf8'));
// Extract the first node (assuming only one for now)
var nodeKey = Object.keys(figmaData.Result.nodes)[0];
var node = figmaData.Result.nodes[nodeKey].document;
// Extract image fill if present
var imageFill = node.fills && node.fills.find(function (f) { return f.type === 'IMAGE'; });
// Extract width and height for the image
var width = (_b = node.absoluteBoundingBox) === null || _b === void 0 ? void 0 : _b.width;
var height = (_c = node.absoluteBoundingBox) === null || _c === void 0 ? void 0 : _c.height;
// Get the first image in the images folder
var imagesDir = path.join(__dirname, 'images');
var localImage = null;
try {
    var images = fs.readdirSync(imagesDir).filter(function (f) { return /\.(jpe?g|png|gif)$/i.test(f); });
    if (images.length > 0) {
        localImage = "images/".concat(images[0]);
    }
}
catch (e) {
    localImage = null;
}
// Extract style fields from Figma node if possible
var styles = {
    layout: node.layoutAlign || null,
    padding: {
        all: node.padding !== undefined ? node.padding : null
    },
    margin: {
        all: node.margin !== undefined ? node.margin : null
    },
    borderRadius: {
        all: node.cornerRadius != null ? "rounded-[".concat(node.cornerRadius, "px]") : null
    },
    rotation: {
        custom: node.rotation !== undefined ? "".concat(node.rotation, "deg") : null
    },
    width: width ? "w-[".concat(Math.round(width), "px]") : null,
    minWidth: node.minWidth !== undefined ? node.minWidth : null,
    maxWidth: node.maxWidth !== undefined ? node.maxWidth : null,
    height: height ? "h-[".concat(Math.round(height), "px]") : null
};
var unifyObj = (_a = {},
    _a[node.id] = {
        component: {
            componentType: node.type || null,
            appearance: {
                objectFit: imageFill && imageFill.scaleMode ? imageFill.scaleMode : null,
                styles: styles
            },
            content: {
                src: localImage,
                alt: node.name || null
            }
        },
        dpOn: [],
        visibility: {
            value: true
        },
        displayName: node.name || null,
        dataSourceIds: [],
        id: node.id,
        events: [
            {
                action: {
                    actionType: 'controlBlockMethod',
                    payload: {
                        blockId: node.id,
                        methodName: 'openInMediaViewer'
                    },
                    id: 'act_' + node.id
                },
                id: 'evt_' + node.id,
                eventType: 'onClick'
            }
        ],
        parentId: 'root_id'
    },
    _a);
// Write to unify.json
fs.writeFileSync('unify.json', JSON.stringify(unifyObj, null, 2), 'utf8');
console.log('unify.json created successfully.');
