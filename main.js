import * as THREE from "three";
import { gsap } from "gsap";

// Waitlist backend — create a free form at https://formspree.io,
// then replace YOUR_FORM_ID below with the real form ID (see README).
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

/* ============ Saved-item definitions ============ */

const TYPE_COLORS = { link: "#0A84FF", image: "#E1306C", video: "#FF3B30" };

const CARD_DEFS = [
  { type: "link", domain: "REDDIT.COM", dot: "#FF4500", title: "The perfect backpack, found" },
  { type: "image", scene: "sunset", caption: "IMG_2041.jpg" },
  { type: "video", domain: "YOUTUBE.COM", title: "Wes Anderson colour grading", duration: "12:04" },
  { type: "link", domain: "X.COM", dot: "#111417", title: "Thread: 12 tools I actually use" },
  { type: "image", scene: "sea", caption: "IMG_1187.jpg" },
  { type: "video", domain: "YOUTUBE.COM", title: "Make focaccia at home", duration: "8:32" },
  { type: "link", domain: "INSTAGRAM.COM", dot: "#E1306C", title: "Kitchen tile ideas" },
  { type: "image", scene: "meadow", caption: "IMG_0512.jpg" },
  { type: "link", domain: "THEVERGE.COM", dot: "#5E5CE6", title: "The best reading chair" },
  { type: "video", domain: "VIMEO.COM", title: "Tokyo at night — 4K", duration: "3:11" },
  { type: "link", domain: "NYTIMES.COM", dot: "#111417", title: "Why we hoard tabs" },
  { type: "image", scene: "dusk", caption: "IMG_3308.jpg" },
  { type: "link", domain: "GITHUB.COM", dot: "#111417", title: "awesome-swiftui" },
  { type: "video", domain: "YOUTUBE.COM", title: "SwiftData in 100 seconds", duration: "2:41" },
];

/* ============ Card texture painters ============ */

function roundRect(ctx, x, y, rw, rh, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, rw, rh, r);
  ctx.fill();
}

function paintCardBase(ctx, w, h, r) {
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, r);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.strokeStyle = "rgba(17,20,23,0.14)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function paintChip(ctx, text, color, x, y) {
  ctx.font = "800 30px Archivo, sans-serif";
  const width = ctx.measureText(text).width + 44;
  ctx.fillStyle = color;
  roundRect(ctx, x, y, width, 54, 27);
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 22, y + 29);
  ctx.textBaseline = "alphabetic";
  return width;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(" ");
  let line = "";
  let lines = 0;
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight);
      lines += 1;
      if (lines >= maxLines) return;
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) ctx.fillText(line, x, y + lines * lineHeight);
}

function paintLinkCard(ctx, w, h, def) {
  paintCardBase(ctx, w, h, 56);
  paintChip(ctx, "LINK", TYPE_COLORS.link, 56, 48);

  ctx.fillStyle = def.dot;
  ctx.beginPath();
  ctx.arc(76, 190, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8A8F96";
  ctx.font = "600 30px Archivo, sans-serif";
  ctx.fillText(def.domain, 116, 201);

  ctx.fillStyle = "#111417";
  ctx.font = "800 56px Archivo, sans-serif";
  wrapText(ctx, def.title, 56, 300, w - 112, 68, 2);

  ctx.fillStyle = "#D7DADE";
  roundRect(ctx, 56, 430, w * 0.62, 20, 8);
  roundRect(ctx, 56, 474, w * 0.44, 20, 8);
}

const SCENES = {
  sunset(ctx, x, y, w, h) {
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, "#FFB347");
    sky.addColorStop(0.6, "#FF5E62");
    sky.addColorStop(1, "#8E2DE2");
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#FFF3B0";
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.52, 74, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(60,20,90,0.55)";
    ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
  },
  sea(ctx, x, y, w, h) {
    const water = ctx.createLinearGradient(0, y, 0, y + h);
    water.addColorStop(0, "#36D1DC");
    water.addColorStop(1, "#2B5BE2");
    ctx.fillStyle = water;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 8;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x + w * (0.2 + i * 0.22), y + h * (0.35 + (i % 2) * 0.25), 46, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  },
  meadow(ctx, x, y, w, h) {
    ctx.fillStyle = "#6EC9FF";
    ctx.fillRect(x, y, w, h * 0.55);
    ctx.fillStyle = "#5FC152";
    ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
    ctx.fillStyle = "#FFDE59";
    ctx.beginPath();
    ctx.arc(x + w * 0.74, y + h * 0.24, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.3, y + h * 0.2, 78, 34, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  dusk(ctx, x, y, w, h) {
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, "#2B1E66");
    sky.addColorStop(1, "#7A3FA6");
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#1A1240";
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w * 0.34, y + h * 0.52);
    ctx.lineTo(x + w * 0.62, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.4, y + h);
    ctx.lineTo(x + w * 0.76, y + h * 0.6);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#FFF6C9";
    for (let i = 0; i < 14; i++) {
      ctx.fillRect(x + ((i * 137) % w), y + ((i * 53) % (h * 0.42)), 5, 5);
    }
  },
};

function paintImageCard(ctx, w, h, def) {
  paintCardBase(ctx, w, h, 48);
  // polaroid: photo on top, white band below
  const pad = 30;
  const photoH = h - 170;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad, pad, w - pad * 2, photoH, 30);
  ctx.clip();
  SCENES[def.scene](ctx, pad, pad, w - pad * 2, photoH);
  ctx.restore();

  paintChip(ctx, "IMAGE", TYPE_COLORS.image, pad + 22, pad + 22);

  ctx.fillStyle = "#8A8F96";
  ctx.font = "600 30px Archivo, sans-serif";
  ctx.fillText(def.caption, pad + 4, h - 62);
}

function paintVideoCard(ctx, w, h, def) {
  paintCardBase(ctx, w, h, 56);
  // thumbnail
  const pad = 28;
  const thumbH = h - 200;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad, pad, w - pad * 2, thumbH, 34);
  ctx.clip();
  const grad = ctx.createLinearGradient(0, pad, w, pad + thumbH);
  grad.addColorStop(0, "#23233F");
  grad.addColorStop(1, "#0E0E1C");
  ctx.fillStyle = grad;
  ctx.fillRect(pad, pad, w - pad * 2, thumbH);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(w * 0.78, pad + thumbH * 0.2, 130, 0, Math.PI * 2);
  ctx.fill();

  // play button
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.arc(w / 2, pad + thumbH / 2, 74, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TYPE_COLORS.video;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 22, pad + thumbH / 2 - 34);
  ctx.lineTo(w / 2 + 40, pad + thumbH / 2);
  ctx.lineTo(w / 2 - 22, pad + thumbH / 2 + 34);
  ctx.closePath();
  ctx.fill();

  // duration
  ctx.fillStyle = "rgba(10,10,18,0.82)";
  ctx.font = "700 30px Archivo, sans-serif";
  const durWidth = ctx.measureText(def.duration).width + 40;
  roundRect(ctx, w - pad - durWidth - 18, pad + thumbH - 74, durWidth, 52, 14);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(def.duration, w - pad - durWidth + 2, pad + thumbH - 38);
  ctx.restore();

  paintChip(ctx, "VIDEO", TYPE_COLORS.video, pad + 22, pad + 22);

  // "SOON" sticker
  ctx.save();
  ctx.translate(w - 120, 74);
  ctx.rotate(-0.12);
  ctx.font = "800 28px Archivo, sans-serif";
  ctx.fillStyle = "#FFD60A";
  roundRect(ctx, -62, -28, 124, 56, 14);
  ctx.fillStyle = "#111417";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SOON", 0, 2);
  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // title + domain
  ctx.fillStyle = "#111417";
  ctx.font = "800 46px Archivo, sans-serif";
  wrapText(ctx, def.title, pad + 8, h - 108, w - pad * 2 - 16, 54, 1);
  ctx.fillStyle = "#8A8F96";
  ctx.font = "600 28px Archivo, sans-serif";
  ctx.fillText(def.domain, pad + 8, h - 54);
}

function makeCardTexture(def) {
  const portrait = def.type === "image";
  const w = portrait ? 768 : 1024;
  const h = portrait ? 1024 : 672;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  if (def.type === "link") paintLinkCard(ctx, w, h, def);
  else if (def.type === "image") paintImageCard(ctx, w, h, def);
  else paintVideoCard(ctx, w, h, def);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/* ============ Scene ============ */

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
camera.position.set(0, 0, 9);

scene.add(new THREE.AmbientLight(0xffffff, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(3, 6, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.radius = 12;
sun.shadow.camera.left = -10;
sun.shadow.camera.right = 10;
sun.shadow.camera.top = 8;
sun.shadow.camera.bottom = -8;
scene.add(sun);

// backdrop that only shows soft shadows over the CSS background
const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 40),
  new THREE.ShadowMaterial({ opacity: 0.05 })
);
backdrop.position.z = -3.2;
backdrop.receiveShadow = true;
scene.add(backdrop);

/* ============ Stash box ============ */

let isSmall = window.innerWidth < 640;
const BOX = { width: 1.9, depth: 1.1, height: 0.9, wall: 0.05, rotation: -0.28 };
const boxAnchor = new THREE.Vector3();

function anchorForLayout() {
  return isSmall ? [0, 2.2, 0] : [2.9, -1.05, 0];
}
boxAnchor.set(...anchorForLayout());

function makeLabelTexture(base) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 256);

  // blue sticker with the wordmark
  ctx.fillStyle = "#0A84FF";
  roundRect(ctx, 112, 74, 288, 108, 18);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 56px Archivo, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("STASH", 256, 148);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const box = new THREE.Group();
{
  const kraft = "#C9A87C";
  const outer = new THREE.MeshStandardMaterial({ color: kraft, roughness: 0.95 });
  const inner = new THREE.MeshStandardMaterial({ color: "#A9885C", roughness: 0.95 });
  const label = new THREE.MeshStandardMaterial({ map: makeLabelTexture(kraft), roughness: 0.95 });

  const { width: bw, depth: bd, height: bh, wall } = BOX;
  const parts = [
    [[bw, wall, bd], [0, -bh / 2, 0], outer], // bottom
    [[bw, bh, wall], [0, 0, bd / 2], label], // front (label faces camera)
    [[bw, bh, wall], [0, 0, -bd / 2], outer], // back
    [[wall, bh, bd], [-bw / 2, 0, 0], inner], // left
    [[wall, bh, bd], [bw / 2, 0, 0], inner], // right
  ];

  for (const [size, position, material] of parts) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    box.add(mesh);
  }
}
box.position.copy(boxAnchor);
box.rotation.y = BOX.rotation;
scene.add(box);

function jiggleBox() {
  gsap.fromTo(
    box.scale,
    { x: 1.04, y: 0.93, z: 1.04 },
    { x: 1, y: 1, z: 1, duration: 0.5, ease: "elastic.out(1, 0.45)", overwrite: true }
  );
}

/* ============ Cards ============ */

const CARD_COUNT = isSmall ? 8 : 14;
const cards = [];
const landscapeGeometry = new THREE.PlaneGeometry(1.28, 0.84);
const portraitGeometry = new THREE.PlaneGeometry(0.78, 1.04);

for (let i = 0; i < CARD_COUNT; i++) {
  const def = CARD_DEFS[i % CARD_DEFS.length];
  const texture = makeCardTexture(def);
  const portrait = def.type === "image";
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const mesh = new THREE.Mesh(portrait ? portraitGeometry : landscapeGeometry, material);
  mesh.castShadow = true;
  // rounded corners should not cast square shadows
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: texture,
    alphaTest: 0.4,
  });

  const seed = { x: Math.random(), y: Math.random(), z: Math.random() };
  const halfHeight = portrait ? 0.52 : 0.42;

  const card = {
    mesh,
    seed,
    halfHeight,
    index: i,
    home: new THREE.Vector3(),
    slot: { position: new THREE.Vector3(), rotation: new THREE.Euler() },
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.35,
    baseRotation: new THREE.Euler(
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.9,
      (Math.random() - 0.5) * 0.5
    ),
    stashed: false,
    dragging: false,
  };

  scene.add(mesh);
  cards.push(card);
}

// keep the drift field clear of the text column: right half on desktop,
// upper half on mobile; slots stand like files inside the box, fanned
// front-to-back, tops peeking over the rim at staggered heights
function applyLayout() {
  boxAnchor.set(...anchorForLayout());
  box.position.copy(boxAnchor);
  // pull the camera back on narrow screens so the fixed-size world fits
  camera.position.z = isSmall ? 13.5 : 9;

  for (const card of cards) {
    const { seed, index: i, halfHeight } = card;
    if (isSmall) {
      card.home.set((seed.x - 0.5) * 3.6, 3.0 + seed.y * 1.6, (seed.z - 0.5) * 2.4);
    } else {
      card.home.set(1.4 + seed.x * 3.8, 0.4 + (seed.y - 0.5) * 3.8, (seed.z - 0.5) * 2.4);
    }

    const t = (i / Math.max(CARD_COUNT - 1, 1) - 0.5) * (BOX.depth * 0.62);
    card.slot.position.set(
      boxAnchor.x + t * Math.sin(BOX.rotation),
      boxAnchor.y + (halfHeight - 0.3) + (i % 3) * 0.055,
      boxAnchor.z + t * Math.cos(BOX.rotation)
    );
    card.slot.rotation.set(0, BOX.rotation, (i % 2 ? 1 : -1) * 0.035);

    if (card.stashed && !card.dragging) {
      card.mesh.position.copy(card.slot.position);
      card.mesh.rotation.copy(card.slot.rotation);
    }
  }
}
applyLayout();

for (const card of cards) {
  if (reducedMotion) {
    card.mesh.position.copy(card.slot.position);
    card.mesh.rotation.copy(card.slot.rotation);
    card.stashed = true;
  } else {
    card.mesh.position.copy(card.home);
    card.mesh.rotation.copy(card.baseRotation);
  }
}

/* ============ Counter & hint ============ */

const counterEl = document.querySelector("[data-counter]");
const hintEl = document.querySelector("[data-hint]");
let hintDismissed = false;

if (coarsePointer) hintEl.textContent = "Try it — tap a card to stash it.";

function positionCounter() {
  const below = new THREE.Vector3(
    boxAnchor.x,
    boxAnchor.y - BOX.height / 2 - 0.35,
    boxAnchor.z
  ).project(camera);
  counterEl.style.left = `${((below.x + 1) / 2) * window.innerWidth}px`;
  counterEl.style.top = `${((-below.y + 1) / 2) * window.innerHeight}px`;
}

function updateCounter() {
  const count = cards.filter((c) => c.stashed).length;
  counterEl.textContent =
    count === CARD_COUNT ? "All stashed ✓" : `${count} / ${CARD_COUNT} stashed`;
  gsap.to(counterEl, { opacity: count > 0 ? 1 : 0, duration: 0.4 });
}

function dismissHint() {
  if (hintDismissed) return;
  hintDismissed = true;
  gsap.to(hintEl, { opacity: 0, duration: 0.5 });
}

/* ============ State & animation loop ============ */

let state = reducedMotion ? "stashed" : "drift"; // drift | gather | stashed
const pointer = new THREE.Vector2(10, 10); // offscreen until first move
const cameraTarget = new THREE.Vector2(0, 0);
const workVector = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

function resize() {
  const { innerWidth: w, innerHeight: h } = window;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  const smallNow = w < 640;
  if (smallNow !== isSmall) {
    isSmall = smallNow;
    applyLayout();
  }
  positionCounter();
}
resize();
window.addEventListener("resize", resize);

window.addEventListener("pointermove", (event) => {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
});

/* ============ Drag to stash ============ */

let dragCard = null;
const dragPlane = new THREE.Plane();
const dragPoint = new THREE.Vector3();
const dragOffset = new THREE.Vector3();
const dragTarget = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();

function raycastCard() {
  raycaster.setFromCamera(pointer, camera);
  const meshes = cards.filter((c) => !c.stashed).map((c) => c.mesh);
  const hit = raycaster.intersectObjects(meshes)[0];
  return hit ? cards.find((c) => c.mesh === hit.object) : null;
}

function isOverBox(position) {
  return (
    Math.abs(position.x - boxAnchor.x) < 1.3 &&
    Math.abs(position.z - boxAnchor.z) < 1.2 &&
    position.y > boxAnchor.y - 0.6 &&
    position.y < boxAnchor.y + 2.8
  );
}

function dropCard(card, delay, fromUser) {
  if (card.stashed) return;
  card.stashed = true;
  card.dragging = false;
  const { position, rotation } = card.slot;

  gsap.to(card.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
  const drop = gsap.timeline({ delay });
  drop
    .to(card.mesh.position, {
      x: position.x,
      y: boxAnchor.y + 1.5,
      z: position.z,
      duration: 0.5,
      ease: "power2.out",
    })
    .to(
      card.mesh.rotation,
      { x: rotation.x, y: rotation.y, z: rotation.z, duration: 0.5, ease: "power2.out" },
      "<"
    )
    .to(card.mesh.position, {
      y: position.y,
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        jiggleBox();
        updateCounter();
      },
    });

  if (fromUser) dismissHint();
}

if (!reducedMotion) {
  window.addEventListener("pointerdown", (event) => {
    if (state === "stashed") return;
    if (event.target.closest("input, button, a, form")) return;

    pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    const card = raycastCard();
    if (!card) return;

    if (coarsePointer) {
      dropCard(card, 0, true);
      return;
    }

    dragCard = card;
    card.dragging = true;
    document.body.classList.add("is-dragging");

    camera.getWorldDirection(cameraDirection);
    dragPlane.setFromNormalAndCoplanarPoint(cameraDirection.clone().negate(), card.mesh.position);
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(dragPlane, dragPoint);
    dragOffset.copy(card.mesh.position).sub(dragPoint);
    dragTarget.copy(card.mesh.position);

    gsap.to(card.mesh.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.25 });
    gsap.to(card.mesh.rotation, { x: 0, y: 0, z: 0.04, duration: 0.3 });
    event.preventDefault();
  });

  window.addEventListener("pointermove", () => {
    if (!dragCard) return;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(dragPlane, dragPoint)) {
      dragTarget.copy(dragPoint).add(dragOffset);
    }
  });

  window.addEventListener("pointerup", () => {
    if (!dragCard) return;
    const card = dragCard;
    dragCard = null;
    card.dragging = false;
    document.body.classList.remove("is-dragging");

    if (isOverBox(card.mesh.position)) {
      dropCard(card, 0, true);
    } else {
      gsap.to(card.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
    }
  });
}

/* ============ Loop ============ */

const clock = new THREE.Clock();
let running = true;

function renderFrame() {
  const t = clock.getElapsedTime();

  // camera parallax (rests while dragging so aim stays steady)
  if (!dragCard) {
    cameraTarget.lerp(pointer.clone().multiplyScalar(0.4), 0.03);
  }
  camera.position.x = cameraTarget.x;
  camera.position.y = cameraTarget.y * 0.6;
  camera.lookAt(0, 0, 0);

  // the box idles with a slow breath
  if (state !== "stashed") {
    box.position.y = boxAnchor.y + Math.sin(t * 0.9) * 0.04;
  }

  // cursor grab affordance
  if (!coarsePointer && !dragCard && state !== "stashed") {
    document.body.classList.toggle("is-card-hover", Boolean(raycastCard()));
  }

  for (const card of cards) {
    if (card.stashed) continue;

    if (card.dragging) {
      card.mesh.position.lerp(dragTarget, 0.35);
      // a touch of sway from drag velocity
      card.mesh.rotation.z = THREE.MathUtils.clamp(
        (dragTarget.x - card.mesh.position.x) * -0.4,
        -0.25,
        0.25
      );
      continue;
    }

    if (state === "drift") {
      workVector.set(
        card.home.x + Math.sin(t * card.speed + card.phase) * 0.35,
        card.home.y + Math.cos(t * card.speed * 0.8 + card.phase) * 0.3,
        card.home.z + Math.sin(t * card.speed * 0.6 + card.phase * 2) * 0.25
      );

      // cards lean away from the cursor like disturbed paper
      if (!coarsePointer) {
        const projected = card.mesh.position.clone().project(camera);
        const dx = projected.x - pointer.x;
        const dy = projected.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.35) {
          const push = (0.35 - dist) * 1.6;
          workVector.x += dx * push;
          workVector.y += dy * push;
        }
      }

      card.mesh.position.lerp(workVector, 0.035);
      card.mesh.rotation.x = card.baseRotation.x + Math.sin(t * 0.5 + card.phase) * 0.12;
      card.mesh.rotation.y = card.baseRotation.y + Math.cos(t * 0.4 + card.phase) * 0.16;
      card.mesh.rotation.z = card.baseRotation.z + Math.sin(t * 0.3 + card.phase) * 0.06;
    } else if (state === "gather") {
      // hover above the box, waiting to be stashed
      workVector.set(
        card.slot.position.x + Math.sin(t * card.speed + card.phase) * 0.3,
        boxAnchor.y + 1.7 + Math.cos(t * card.speed + card.phase) * 0.2,
        card.slot.position.z + 0.3
      );
      card.mesh.position.lerp(workVector, 0.025);
      card.mesh.rotation.x *= 0.99;
      card.mesh.rotation.y *= 0.99;
      card.mesh.rotation.z *= 0.99;
    }
  }

  renderer.render(scene, camera);
}

function tick() {
  if (!running) return;
  renderFrame();
  requestAnimationFrame(tick);
}

if (reducedMotion) {
  renderer.render(scene, camera); // single static frame, already stashed
} else {
  tick();
}

document.addEventListener("visibilitychange", () => {
  running = !document.hidden && !reducedMotion;
  if (running) {
    clock.start();
    tick();
  }
});

// manual stepping hook for environments where rAF is suspended (previews, tests)
window.__stash = { renderFrame, gsap, cards, dropCard, camera, get state() { return state; } };

/* ============ Stash them all (form success) ============ */

function stashCards() {
  state = "stashed";
  document.body.classList.remove("is-card-hover");
  gsap.to(box.position, { y: boxAnchor.y, duration: 0.4, ease: "power2.out" });

  let order = 0;
  for (const card of cards) {
    if (card.stashed) continue;
    dropCard(card, order * 0.09, false);
    order += 1;
  }
  dismissHint();
}
window.__stash.stashAll = stashCards;

/* ============ Headline fit ============ */

// downscale any headline line that overflows its column (never upscales)
function fitHeadline() {
  document.querySelectorAll(".line-inner").forEach((el) => {
    el.style.fontSize = "";
    const available = el.parentElement.clientWidth;
    const width = el.getBoundingClientRect().width;
    if (width > available) {
      const current = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = `${Math.floor(current * (available / width) * 0.99)}px`;
    }
  });
}
document.fonts.ready.then(fitHeadline);
window.addEventListener("resize", fitHeadline);

/* ============ Intro ============ */

if (!reducedMotion) {
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .to(".line-inner", { y: 0, duration: 1.0, stagger: 0.12, delay: 0.2 })
    .to(".headline-note", { opacity: 1, duration: 0.6 }, "-=0.4")
    .to(".sub", { opacity: 1, duration: 0.8 }, "-=0.4")
    .to(".waitlist", { opacity: 1, duration: 0.8 }, "-=0.55")
    .to(".hint", { opacity: 1, duration: 0.8 }, "-=0.4");
}

/* ============ Cursor dot & magnetic button ============ */

if (!coarsePointer && !reducedMotion) {
  const cursor = document.querySelector(".cursor");
  const moveX = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power2.out" });
  const moveY = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power2.out" });

  window.addEventListener("pointermove", (event) => {
    gsap.to(cursor, { opacity: 1, duration: 0.2 });
    moveX(event.clientX);
    moveY(event.clientY);
  });

  document.querySelectorAll("a, button, input").forEach((el) => {
    el.addEventListener("pointerenter", () => gsap.to(cursor, { scale: 2.6, duration: 0.25 }));
    el.addEventListener("pointerleave", () => gsap.to(cursor, { scale: 1, duration: 0.25 }));
  });

  const button = document.querySelector("[data-magnetic]");
  const label = button.querySelector("span");
  const pullX = gsap.quickTo(button, "x", { duration: 0.35, ease: "power3.out" });
  const pullY = gsap.quickTo(button, "y", { duration: 0.35, ease: "power3.out" });

  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    pullX(dx * 0.25);
    pullY(dy * 0.35);
    gsap.to(label, { x: dx * 0.1, y: dy * 0.15, duration: 0.35 });
  });

  button.addEventListener("pointerleave", () => {
    pullX(0);
    pullY(0);
    gsap.to(label, { x: 0, y: 0, duration: 0.35 });
  });
}

/* ============ Waitlist form ============ */

const form = document.querySelector("[data-waitlist]");
const note = form.querySelector(".form-note");
const submitButton = form.querySelector("button");
const emailInput = form.querySelector("input");

emailInput.addEventListener("focus", () => {
  if (state === "drift") state = "gather";
});

emailInput.addEventListener("blur", () => {
  if (state === "gather") state = "drift";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  note.className = "form-note";
  note.textContent = "";
  submitButton.disabled = true;

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    stashCards();
    note.classList.add("is-success");
    note.textContent = "Stashed. We'll remind you when it's ready.";
    form.reset();
    emailInput.blur();
  } catch {
    note.classList.add("is-error");
    note.textContent = "Something went wrong. Please try again in a moment.";
  } finally {
    submitButton.disabled = false;
  }
});
