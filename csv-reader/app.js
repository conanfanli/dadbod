// --- IndexedDB (user-uploaded decks only) ---

const DB_NAME = "csv-reader";
const DB_VERSION = 1;
const STORE_NAME = "decks";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllUserDecks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveUserDeck(deck) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(deck);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteUserDeck(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// --- Manifest (built-in decks, fetched lazily) ---

let manifest = [];

async function loadManifest() {
  try {
    const resp = await fetch("decks.json");
    if (resp.ok) manifest = await resp.json();
  } catch {}
}

async function fetchManifestDeck(entry) {
  const resp = await fetch(entry.file);
  if (!resp.ok) throw new Error(`Failed to load ${entry.file}`);
  const csv = await resp.text();
  const result = Papa.parse(csv.trim(), { header: true, skipEmptyLines: true });
  const cols = result.meta.fields;
  return {
    name: entry.name,
    columns: cols,
    rows: result.data,
    imageCol: "image",
    textCols: cols.filter((c) => c !== "image"),
  };
}

// --- Views ---

const views = document.querySelectorAll(".view");
function showView(id) {
  views.forEach((v) => v.classList.toggle("active", v.id === id));
}

// --- DOM refs ---

const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const urlInput = document.getElementById("url-input");
const urlFetchBtn = document.getElementById("url-fetch-btn");
const urlError = document.getElementById("url-error");
const deckList = document.getElementById("deck-list");

const pickerFilename = document.getElementById("picker-filename");
const imageColButtons = document.getElementById("image-col-buttons");
const textColButtons = document.getElementById("text-col-buttons");
const deckNameInput = document.getElementById("deck-name-input");
const saveDeckBtn = document.getElementById("save-deck-btn");
const startReadingBtn = document.getElementById("start-reading-btn");
const pickerBackBtn = document.getElementById("picker-back-btn");

const readerBackBtn = document.getElementById("reader-back-btn");
const readerTitle = document.getElementById("reader-title");
const readerProgress = document.getElementById("reader-progress");
const readerImage = document.getElementById("reader-image");
const readerTexts = document.getElementById("reader-texts");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// --- State ---

let pendingParse = null;
let selectedImageCol = null;
let selectedTextCols = [];
let currentDeck = null;
let currentRow = 0;

// --- CSV upload / URL fetch ---

function parseCSV(text, filename) {
  const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
  if (!result.data.length || !result.meta.fields.length) return;
  pendingParse = { filename, columns: result.meta.fields, rows: result.data };
  selectedImageCol = null;
  selectedTextCols = [];
  showColumnPicker();
}

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = () => parseCSV(reader.result, file.name);
  reader.readAsText(file);
}

uploadArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
  fileInput.value = "";
});

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});
uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

urlFetchBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return;
  urlError.classList.add("hidden");
  urlError.textContent = "";
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    parseCSV(text, url.split("/").pop() || "fetched.csv");
  } catch {
    urlError.textContent = "couldn't fetch URL (likely blocked by CORS). try uploading the file directly instead.";
    urlError.classList.remove("hidden");
  }
});

// --- Column picker ---

function showColumnPicker() {
  pickerFilename.textContent = pendingParse.filename;
  deckNameInput.value = pendingParse.filename.replace(/\.\w+$/, "");
  imageColButtons.innerHTML = "";
  textColButtons.innerHTML = "";
  updatePickerButtons();
  showView("picker-view");

  for (const col of pendingParse.columns) {
    const imgBtn = document.createElement("button");
    imgBtn.textContent = col;
    imgBtn.addEventListener("click", () => {
      selectedImageCol = col;
      updatePickerButtons();
    });
    imageColButtons.appendChild(imgBtn);

    const txtBtn = document.createElement("button");
    txtBtn.textContent = col;
    txtBtn.addEventListener("click", () => {
      const idx = selectedTextCols.indexOf(col);
      if (idx === -1) selectedTextCols.push(col);
      else selectedTextCols.splice(idx, 1);
      updatePickerButtons();
    });
    textColButtons.appendChild(txtBtn);
  }
}

function updatePickerButtons() {
  for (const btn of imageColButtons.children) {
    btn.classList.toggle("selected", btn.textContent === selectedImageCol);
  }
  for (const btn of textColButtons.children) {
    btn.classList.toggle("selected", selectedTextCols.includes(btn.textContent));
  }
  const ready = selectedImageCol && selectedTextCols.length > 0;
  saveDeckBtn.disabled = !ready;
  startReadingBtn.disabled = !ready;
}

saveDeckBtn.addEventListener("click", async () => {
  if (!pendingParse) return;
  try {
    await saveUserDeck({
      name: deckNameInput.value.trim() || pendingParse.filename,
      columns: pendingParse.columns,
      rows: pendingParse.rows,
      imageCol: selectedImageCol,
      textCols: selectedTextCols,
    });
  } catch {
    alert("Storage full — delete old decks to free space.");
    return;
  }
  showView("library-view");
  renderDeckList();
});

startReadingBtn.addEventListener("click", () => {
  if (!pendingParse) return;
  openReader({
    name: deckNameInput.value.trim() || pendingParse.filename,
    rows: pendingParse.rows,
    imageCol: selectedImageCol,
    textCols: selectedTextCols,
  });
});

pickerBackBtn.addEventListener("click", () => {
  showView("library-view");
  renderDeckList();
});

// --- Library ---

async function renderDeckList() {
  deckList.innerHTML = "";

  for (const entry of manifest) {
    const div = document.createElement("div");
    div.className = "deck-item";
    const info = document.createElement("span");
    info.className = "deck-info";
    info.textContent = entry.name;
    info.addEventListener("click", async () => {
      info.textContent = "Loading...";
      try {
        const deck = await fetchManifestDeck(entry);
        openReader(deck);
      } catch {
        info.textContent = `${entry.name} (failed to load)`;
      }
    });
    div.appendChild(info);
    deckList.appendChild(div);
  }

  const userDecks = await getAllUserDecks();
  for (const deck of userDecks) {
    const div = document.createElement("div");
    div.className = "deck-item";
    const info = document.createElement("span");
    info.className = "deck-info";
    info.textContent = `${deck.name} (${deck.rows.length} rows)`;
    info.addEventListener("click", () => openReader(deck));
    const del = document.createElement("button");
    del.className = "deck-delete";
    del.textContent = "Delete";
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      await deleteUserDeck(deck.id);
      renderDeckList();
    });
    div.appendChild(info);
    div.appendChild(del);
    deckList.appendChild(div);
  }
}

// --- Reader ---

function openReader(deck) {
  currentDeck = deck;
  currentRow = 0;
  readerTitle.textContent = deck.name;
  renderRow();
  showView("reader-view");
}

function renderRow() {
  speechSynthesis.cancel();
  if (!currentDeck || !currentDeck.rows.length) return;
  const row = currentDeck.rows[currentRow];
  readerImage.src = row[currentDeck.imageCol] || "";
  readerTexts.innerHTML = "";
  for (const col of currentDeck.textCols) {
    const div = document.createElement("div");
    div.className = "text-row";
    const p = document.createElement("p");
    p.className = "text-row-content";
    p.textContent = row[col] || "";
    const btn = document.createElement("button");
    btn.className = "text-row-speak";
    btn.textContent = "▶";
    btn.addEventListener("click", () => speakText(row[col] || "", btn));
    div.appendChild(p);
    div.appendChild(btn);
    readerTexts.appendChild(div);
  }
  readerProgress.textContent = `${currentRow + 1} / ${currentDeck.rows.length}`;
  prevBtn.disabled = currentRow === 0;
  nextBtn.disabled = currentRow === currentDeck.rows.length - 1;
}

prevBtn.addEventListener("click", () => {
  if (currentRow > 0) { currentRow--; renderRow(); }
});
nextBtn.addEventListener("click", () => {
  if (currentRow < currentDeck.rows.length - 1) { currentRow++; renderRow(); }
});

readerBackBtn.addEventListener("click", () => {
  speechSynthesis.cancel();
  showView("library-view");
  renderDeckList();
});

// --- Speech ---

function detectLang(text) {
  if (/[一-鿿]/.test(text)) return "zh-CN";
  if (/[぀-ゟ゠-ヿ]/.test(text)) return "ja";
  if (/[가-힯]/.test(text)) return "ko";
  if (/[؀-ۿ]/.test(text)) return "ar";
  if (/[ऀ-ॿ]/.test(text)) return "hi";
  if (/[áéíóúñ¿¡]/i.test(text)) return "es";
  if (/[àâçéèêëîïôùûü]/i.test(text)) return "fr";
  if (/[äöüß]/i.test(text)) return "de";
  if (/[àèéìòù]/i.test(text)) return "it";
  if (/[ãõçá]/i.test(text)) return "pt";
  return "";
}

let voiceCache = {};
function loadVoices() {
  voiceCache = {};
  for (const v of speechSynthesis.getVoices()) {
    const lang = v.lang.slice(0, 2);
    const prev = voiceCache[lang];
    if (!prev) { voiceCache[lang] = v; continue; }
    const score = (v) => (v.localService ? 0 : 2) + (/enhanced|premium|compact/i.test(v.name) ? 1 : 0);
    if (score(v) > score(prev)) voiceCache[lang] = v;
  }
}
speechSynthesis.addEventListener("voiceschanged", loadVoices);
loadVoices();

function bestVoice(lang) {
  if (!lang) return null;
  return voiceCache[lang.slice(0, 2)] || null;
}

function speakText(text, btn) {
  const wasPlaying = btn.classList.contains("playing");
  speechSynthesis.cancel();
  document.querySelectorAll(".text-row-speak.playing").forEach((b) => {
    b.textContent = "▶";
    b.classList.remove("playing");
  });
  if (wasPlaying) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = detectLang(text);
  if (lang) utterance.lang = lang;
  const voice = bestVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.rate = 0.75;
  btn.textContent = "■";
  btn.classList.add("playing");
  utterance.onend = () => { btn.textContent = "▶"; btn.classList.remove("playing"); };
  speechSynthesis.speak(utterance);
}

// --- Init ---

loadManifest().then(() => renderDeckList());
