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

async function getAllDecks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDeck(deck) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(deck);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteDeck(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

const views = document.querySelectorAll(".view");
function showView(id) {
  views.forEach(v => v.classList.toggle("active", v.id === id));
}

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
const languageSwitcher = document.getElementById("language-switcher");
const readerImage = document.getElementById("reader-image");
const readerText = document.getElementById("reader-text");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const speakBtn = document.getElementById("speak-btn");

let pendingParse = null;
let selectedImageCol = null;
let selectedTextCols = [];

let currentDeck = null;
let currentRow = 0;
let currentTextCol = null;

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

uploadArea.addEventListener("dragover", e => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});
uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
uploadArea.addEventListener("drop", e => {
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
  const deck = {
    name: deckNameInput.value.trim() || pendingParse.filename,
    columns: pendingParse.columns,
    rows: pendingParse.rows,
    imageCol: selectedImageCol,
    textCols: selectedTextCols,
  };
  try {
    await saveDeck(deck);
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

async function renderDeckList() {
  const decks = await getAllDecks();
  deckList.innerHTML = "";
  if (!decks.length) return;
  for (const deck of decks) {
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
      await deleteDeck(deck.id);
      renderDeckList();
    });

    div.appendChild(info);
    div.appendChild(del);
    deckList.appendChild(div);
  }
}

function openReader(deck) {
  currentDeck = deck;
  currentRow = 0;
  currentTextCol = deck.textCols[0];

  readerTitle.textContent = deck.name;
  languageSwitcher.innerHTML = "";
  for (const col of deck.textCols) {
    const opt = document.createElement("option");
    opt.value = col;
    opt.textContent = col;
    languageSwitcher.appendChild(opt);
  }
  languageSwitcher.value = currentTextCol;

  renderRow();
  showView("reader-view");
}

languageSwitcher.addEventListener("change", () => {
  currentTextCol = languageSwitcher.value;
  renderRow();
});

function renderRow() {
  speechSynthesis.cancel();
  speakBtn.textContent = "Speak";
  if (!currentDeck || !currentDeck.rows.length) return;
  const row = currentDeck.rows[currentRow];
  readerImage.src = row[currentDeck.imageCol] || "";
  readerText.textContent = row[currentTextCol] || "";
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

speakBtn.addEventListener("click", () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    speakBtn.textContent = "Speak";
    return;
  }
  const text = readerText.textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = detectLang(text);
  if (lang) utterance.lang = lang;
  utterance.rate = 0.75;
  utterance.onend = () => speakBtn.textContent = "Speak";
  speakBtn.textContent = "Stop";
  speechSynthesis.speak(utterance);
});

readerBackBtn.addEventListener("click", () => {
  speechSynthesis.cancel();
  showView("library-view");
  renderDeckList();
});

const DEMO_DECKS = [
  {
    name: "Demo",
    csv: `image,english,chinese,spanish
https://picsum.photos/id/10/400/300,A peaceful forest,宁静的森林,Un bosque tranquilo
https://picsum.photos/id/20/400/300,A mountain lake,高山湖泊,Un lago de montaña
https://picsum.photos/id/30/400/300,Wild flowers blooming,野花盛开,Flores silvestres floreciendo
https://picsum.photos/id/40/400/300,City at night,夜晚的城市,Ciudad de noche
https://picsum.photos/id/50/400/300,Ocean waves crashing,海浪拍打,Olas del océano rompiendo`,
    textCols: ["english", "chinese", "spanish"],
  },
  {
    name: "Departure",
    csv: `image,english,chinese,french
https://picsum.photos/id/274/400/300,She woke to the sound of someone else's life,她在别人生活的声响中醒来,Elle s'est réveillée au bruit de la vie d'un autre
https://picsum.photos/id/265/400/300,The apartment smelled like coffee she didn't make,公寓里飘着她没有煮的咖啡香,L'appartement sentait le café qu'elle n'avait pas fait
https://picsum.photos/id/219/400/300,She left without looking back,她头也不回地离开了,Elle est partie sans se retourner
https://picsum.photos/id/43/400/300,The train carried her past towns she'd never name,火车带她经过那些她永远不会知道名字的小镇,Le train l'emportait au-delà de villes dont elle ne saurait jamais le nom
https://picsum.photos/id/58/400/300,The road ahead was empty and endless,前方的路空旷无尽,La route devant elle était vide et sans fin
https://picsum.photos/id/15/400/300,Rain came without warning like grief does,雨毫无预兆地落下就像悲伤那样,La pluie est venue sans prévenir comme le fait le chagrin
https://picsum.photos/id/10/400/300,The forest swallowed her whole,森林将她整个吞没,La forêt l'a engloutie tout entière
https://picsum.photos/id/167/400/300,She built a fire with hands that used to type emails,她用曾经打字发邮件的手生起了火,Elle a fait du feu avec des mains qui tapaient autrefois des emails
https://picsum.photos/id/20/400/300,By the lake she remembered how to breathe,在湖边她重新学会了呼吸,Au bord du lac elle a réappris à respirer
https://picsum.photos/id/180/400/300,A stranger shared bread and said nothing,一个陌生人分了面包给她什么也没说,Un inconnu a partagé son pain sans rien dire
https://picsum.photos/id/119/400/300,The stars were obscene in their abundance,星星多得近乎放肆,Les étoiles étaient obscènes dans leur abondance
https://picsum.photos/id/16/400/300,The mountain asked nothing of her,山什么都没有向她索取,La montagne ne lui demandait rien
https://picsum.photos/id/235/400/300,She slept on the ground and dreamed of nothing,她睡在地上什么梦也没做,Elle a dormi à même le sol et n'a rêvé de rien
https://picsum.photos/id/134/400/300,Morning light hit her face like a second chance,晨光照在她脸上像是第二次机会,La lumière du matin a touché son visage comme une seconde chance
https://picsum.photos/id/177/400/300,She walked back slowly this time,这一次她慢慢地走了回去,Cette fois elle est rentrée lentement
https://picsum.photos/id/259/400/300,The door was still open,门还开着,La porte était encore ouverte`,
    textCols: ["english", "chinese", "french"],
  },
  {
    name: "Mango the Cat",
    csv: `image,english,chinese,french
https://picsum.photos/id/40/400/300,There once was a orange cat named Mango who lived in a little blue house,从前有一只橘猫叫芒果住在一栋蓝色小房子里,Il était une fois un chat orange nommé Mangue qui vivait dans une petite maison bleue
https://picsum.photos/id/349/400/300,Every day Mango sat by the window and watched the birds fly past,每天芒果都坐在窗边看小鸟飞过,Chaque jour Mangue s'asseyait à la fenêtre et regardait les oiseaux passer
https://picsum.photos/id/152/400/300,One morning someone left the door open just a crack,一天早上有人把门留了一条缝,Un matin quelqu'un a laissé la porte entrouverte
https://picsum.photos/id/106/400/300,Mango squeezed through and felt the grass under his paws for the first time,芒果挤了出去第一次感受到脚下的青草,Mangue s'est faufilé dehors et a senti l'herbe sous ses pattes pour la première fois
https://picsum.photos/id/28/400/300,The garden was enormous and full of smells he had no name for,花园好大好大到处是他叫不出名字的味道,Le jardin était immense et plein d'odeurs qu'il ne savait pas nommer
https://picsum.photos/id/237/400/300,A friendly dog said hey little cat where are you going,一只友善的狗说嘿小猫你去哪里呀,Un chien amical lui dit hé petit chat où vas-tu
https://picsum.photos/id/219/400/300,Mango said I am going to see the whole world,芒果说我要去看看整个世界,Mangue a dit je vais voir le monde entier
https://picsum.photos/id/142/400/300,He walked past the red mailbox where the road begins,他走过了路口那个红色邮筒,Il est passé devant la boîte aux lettres rouge où commence la route
https://picsum.photos/id/26/400/300,He crossed a bridge over a stream that sparkled like glitter,他走过一座小桥桥下的溪水像亮片一样闪闪发光,Il a traversé un pont au-dessus d'un ruisseau qui brillait comme des paillettes
https://picsum.photos/id/10/400/300,The forest was dark and cool and smelled like rain,森林又暗又凉闻起来像雨的味道,La forêt était sombre et fraîche et sentait la pluie
https://picsum.photos/id/13/400/300,A squirrel dropped an acorn on his head bonk,一只松鼠把橡子掉到他头上砰的一声,Un écureuil a fait tomber un gland sur sa tête bonk
https://picsum.photos/id/20/400/300,He found a lake so still it looked like a giant mirror,他发现了一个湖安静得像一面巨大的镜子,Il a trouvé un lac si calme qu'il ressemblait à un miroir géant
https://picsum.photos/id/177/400/300,A duck said you are very far from home little cat,一只鸭子说小猫你离家很远了哦,Un canard a dit tu es très loin de chez toi petit chat
https://picsum.photos/id/16/400/300,Mango looked up at the big mountain and felt very small,芒果抬头看着大山觉得自己好小好小,Mangue a regardé la grande montagne et s'est senti tout petit
https://picsum.photos/id/15/400/300,Then the rain came and Mango hid under a big leaf,然后下雨了芒果躲在一片大叶子下面,Puis la pluie est arrivée et Mangue s'est caché sous une grande feuille
https://picsum.photos/id/167/400/300,A kind owl said follow the lights and they will take you home,一只好心的猫头鹰说跟着灯光走它们会带你回家,Un hibou gentil a dit suis les lumières elles te ramèneront chez toi
https://picsum.photos/id/119/400/300,The stars came out one by one like someone was turning on nightlights,星星一颗一颗亮起来就像有人在开小夜灯,Les étoiles sont apparues une à une comme si quelqu'un allumait des veilleuses
https://picsum.photos/id/134/400/300,Mango followed the warm glow of streetlamps back through the town,芒果跟着温暖的路灯光穿过小镇走回去,Mangue a suivi la lueur chaude des réverbères à travers la ville
https://picsum.photos/id/237/400/300,The same friendly dog said welcome back little adventurer,那只友善的狗说欢迎回来小冒险家,Le même chien amical a dit bon retour petit aventurier
https://picsum.photos/id/349/400/300,Mango slipped back through the door that was still open a crack,芒果从那条还开着的门缝溜了回去,Mangue s'est glissé par la porte encore entrouverte
https://picsum.photos/id/40/400/300,He curled up on his favorite blanket warm and dry and safe,他蜷在最喜欢的毯子上又暖又干又安全,Il s'est blotti sur sa couverture préférée au chaud au sec en sécurité
https://picsum.photos/id/152/400/300,But the next morning he checked if the door was open again,但是第二天早上他又去看门有没有开,Mais le lendemain matin il a vérifié si la porte était encore ouverte`,
    textCols: ["english", "chinese", "french"],
  },
];

async function seedDemos() {
  const decks = await getAllDecks();
  const existing = new Set(decks.map((d) => d.name));
  for (const demo of DEMO_DECKS) {
    if (existing.has(demo.name)) continue;
    const result = Papa.parse(demo.csv.trim(), { header: true, skipEmptyLines: true });
    await saveDeck({
      name: demo.name,
      columns: result.meta.fields,
      rows: result.data,
      imageCol: "image",
      textCols: demo.textCols,
    });
  }
}

seedDemos().then(() => renderDeckList());
