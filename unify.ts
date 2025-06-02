import * as fs from 'fs';
import * as path from 'path';

type FigmaBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type FigmaFill = {
  blendMode: string;
  type: string;
  scaleMode?: string;
  imageRef?: string;
  filters?: Record<string, number>;
};

type FigmaNode = {
  id: string;
  name?: string;
  type?: string;
  fills?: FigmaFill[];
  layoutAlign?: string;
  padding?: string;
  margin?: string;
  cornerRadius?: number;
  rotation?: number;
  minWidth?: string;
  maxWidth?: string;
  absoluteBoundingBox?: FigmaBoundingBox;
};

type UnifyStyles = {
  layout: string | null;
  padding: { all: string | null };
  margin: { all: string | null };
  borderRadius: { all: string | null };
  rotation: { custom: string | null };
  width: string | null;
  minWidth: string | null;
  maxWidth: string | null;
  height: string | null;
};

type UnifyComponent = {
  componentType: string | null;
  appearance: {
    objectFit: string | null;
    styles: UnifyStyles;
  };
  content: {
    src: string | null;
    alt: string | null;
  };
};

type UnifyBlock = {
  component: UnifyComponent;
  dpOn: any[];
  visibility: { value: boolean };
  displayName: string | null;
  dataSourceIds: any[];
  id: string;
  events: any[];
  parentId: string;
};

type FigmaJson = {
  Result: {
    nodes: Record<string, { document: FigmaNode }>;
  };
};

// Read Figma JSON
const figmaData: FigmaJson = JSON.parse(fs.readFileSync('figma.json', 'utf8'));

// Extract the first node (assuming only one for now)
const nodeKey = Object.keys(figmaData.Result.nodes)[0];
const node: FigmaNode = figmaData.Result.nodes[nodeKey].document;

// Extract image fill if present
const imageFill = node.fills && node.fills.find(f => f.type === 'IMAGE');

// Extract width and height for the image
const width = node.absoluteBoundingBox?.width;
const height = node.absoluteBoundingBox?.height;

// Get the first image in the images folder
const imagesDir = path.join(__dirname, 'images');
let localImage: string | null = null;
try {
  const images = fs.readdirSync(imagesDir).filter(f => /\.(jpe?g|png|gif)$/i.test(f));
  if (images.length > 0) {
    localImage = `images/${images[0]}`;
  }
} catch (e) {
  localImage = null;
}

// Extract style fields from Figma node if possible
const styles: UnifyStyles = {
  layout: node.layoutAlign || null,
  padding: {
    all: node.padding !== undefined ? node.padding : null
  },
  margin: {
    all: node.margin !== undefined ? node.margin : null
  },
  borderRadius: {
    all: node.cornerRadius != null ? `rounded-[${node.cornerRadius}px]` : null
  },
  rotation: {
    custom: node.rotation !== undefined ? `${node.rotation}deg` : null
  },
  width: width ? `w-[${Math.round(width)}px]` : null,
  minWidth: node.minWidth !== undefined ? node.minWidth : null,
  maxWidth: node.maxWidth !== undefined ? node.maxWidth : null,
  height: height ? `h-[${Math.round(height)}px]` : null
};

const unifyObj: Record<string, UnifyBlock> = {
  [node.id]: {
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
  }
};

// Write to unify.json
fs.writeFileSync('unify.json', JSON.stringify(unifyObj, null, 2), 'utf8');
console.log('unify.json created successfully.'); 