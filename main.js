import * as THREE from "three";
import { gsap } from "gsap";

// Waitlist backend — create a free form at https://formspree.io,
// then replace YOUR_FORM_ID below with the real form ID (see README).
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

/* ============ Saved-item card textures ============ */

const CARD_KINDS = [
  { dot: "#E1306C", domain: "INSTAGRAM.COM", lines: 2 },
  { dot: "#FF0000", domain: "YOUTUBE.COM", lines: 2 },
  { dot: "#FF4500", domain: "REDDIT.COM", lines: 3 },
  { dot: "#111417", domain: "X.COM", lines: 2 },
  { dot: "#30B0C7", domain: "IMAGE", lines: 0 },
  { dot: "#5E5CE6", domain: "ARTICLE", lines: 3 },
];

function makeCardTexture({ dot, domain, lines }) {
  const w = 512, h = 336;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);

  // favicon dot + domain
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(52, 58, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8A8F96";
  ctx.font = "600 22px Archivo, sans-serif";
  ctx.fillText(domain, 84, 66);

  if (lines === 0) {
    // image-style card: one big muted block
    ctx.fillStyle = dot;
    ctx.globalAlpha = 0.25;
    roundRect(ctx, 36, 100, w - 72, h - 140, 14);
    ctx.globalAlpha = 1;
  } else {
    // link-style card: title bar + text lines
    ctx.fillStyle = "#22262B";
    roundRect(ctx, 36, 104, w * 0.72, 26, 8);
    ctx.fillStyle = "#C9CDD2";
    for (let i = 0; i < lines; i++) {
      roundRect(ctx, 36, 156 + i * 40, w * (0.82 - i * 0.16), 18, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function roundRect(ctx, x, y, rw, rh, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, rw, rh, r);
  ctx.fill();
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
  new THREE.ShadowMaterial({ opacity: 0.07 })
);
backdrop.position.z = -3.2;
backdrop.receiveShadow = true;
scene.add(backdrop);

/* ============ Cards ============ */

const isSmall = window.innerWidth < 640;
const CARD_COUNT = isSmall ? 8 : 14;
const cards = [];

// where cards gather + stack: right of centre on desktop, upper half on mobile
const stackAnchor = isSmall
  ? new THREE.Vector3(0, 1.9, 0)
  : new THREE.Vector3(2.9, -0.2, 0);

const cardGeometry = new THREE.PlaneGeometry(1.28, 0.84);
const textures = CARD_KINDS.map(makeCardTexture);

for (let i = 0; i < CARD_COUNT; i++) {
  const material = new THREE.MeshStandardMaterial({
    map: textures[i % textures.length],
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(cardGeometry, material);
  mesh.castShadow = true;

  // keep the drift field clear of the text column: right half on desktop,
  // upper half on mobile
  const home = isSmall
    ? new THREE.Vector3(
        (Math.random() - 0.5) * 3.6,
        1.0 + Math.random() * 2.6,
        (Math.random() - 0.5) * 2.4
      )
    : new THREE.Vector3(
        1.4 + Math.random() * 3.8,
        (Math.random() - 0.5) * 4.4,
        (Math.random() - 0.5) * 2.4
      );

  const slotIndex = i;
  const card = {
    mesh,
    home,
    // stack slot: tidy pile with slight fan
    slot: new THREE.Vector3(
      stackAnchor.x + (slotIndex % 2 ? 0.03 : -0.03) * (slotIndex / 2),
      stackAnchor.y - slotIndex * 0.085,
      stackAnchor.z + slotIndex * 0.02
    ),
    slotRotation: (Math.random() - 0.5) * 0.14,
    phase: Math.random() * Math.PI * 2,
    speed: 0.4 + Math.random() * 0.35,
    baseRotation: new THREE.Euler(
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.9,
      (Math.random() - 0.5) * 0.5
    ),
    stacked: false,
  };

  mesh.position.copy(reducedMotion ? card.slot : home);
  if (reducedMotion) {
    mesh.rotation.set(0, 0, card.slotRotation);
  } else {
    mesh.rotation.copy(card.baseRotation);
  }
  scene.add(mesh);
  cards.push(card);
}

/* ============ State & animation loop ============ */

let state = reducedMotion ? "stacked" : "drift"; // drift | gather | stacked
const pointer = new THREE.Vector2(10, 10); // offscreen until first move
const cameraTarget = new THREE.Vector2(0, 0);
const workVector = new THREE.Vector3();

function resize() {
  const { innerWidth: w, innerHeight: h } = window;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

window.addEventListener("pointermove", (event) => {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
});

const clock = new THREE.Clock();
let running = true;

function tick() {
  if (!running) return;
  const t = clock.getElapsedTime();

  // camera parallax
  cameraTarget.lerp(pointer.clone().multiplyScalar(0.4), 0.03);
  camera.position.x = cameraTarget.x;
  camera.position.y = cameraTarget.y * 0.6;
  camera.lookAt(0, 0, 0);

  for (const card of cards) {
    if (card.stacked) continue;

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
      workVector.copy(card.slot);
      workVector.x += Math.sin(t * card.speed + card.phase) * 0.18;
      workVector.y += Math.cos(t * card.speed + card.phase) * 0.15;
      workVector.z += 0.4;
      card.mesh.position.lerp(workVector, 0.022);
      card.mesh.rotation.x *= 0.995;
      card.mesh.rotation.y *= 0.995;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

if (reducedMotion) {
  renderer.render(scene, camera); // single static frame, already tidy
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

function stackCards() {
  state = "stacked";
  cards.forEach((card, i) => {
    card.stacked = true;
    gsap.to(card.mesh.position, {
      x: card.slot.x,
      y: card.slot.y,
      z: card.slot.z,
      duration: 1.1,
      delay: i * 0.045,
      ease: "power3.inOut",
    });
    gsap.to(card.mesh.rotation, {
      x: 0,
      y: 0,
      z: card.slotRotation,
      duration: 1.1,
      delay: i * 0.045,
      ease: "power3.inOut",
    });
  });
}

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
    .to(".sub", { opacity: 1, duration: 0.8 }, "-=0.5")
    .to(".waitlist", { opacity: 1, duration: 0.8 }, "-=0.55");
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

    stackCards();
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
