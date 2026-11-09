"use strict";

/* NIKIFAMILY BEST CONFIG */

const SUPABASE_URL = "https://rfgdhbyzolizwesthccl.supabase.co";
const SUPABASE_KEY = "sb_publishable_0KCWzdw8rVxd4soh3ZST5w_BK_xjLys";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const STORAGE_NAME = "nikifamily_display_name";

let displayName = localStorage.getItem(STORAGE_NAME) || "";
let topics = [];
let loadingTopics = false;

/* HELPERS */

function $(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showToast(text) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = text;
  toast.classList.remove("hidden");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

function setMessage(id, text, isError = false) {
  const element = $(id);
  if (!element) return;

  element.textContent = text;
  element.style.color = isError ? "#dc2626" : "#16a34a";
}

function getInitial(name) {
  return (name || "م").trim().charAt(0);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function requireName() {
  if (displayName.trim()) return true;

  openNameModal();
  showToast("ابتدا نام نمایشی خود را انتخاب کن.");
  return false;
}

/* DISPLAY NAME */

function updateNameUI() {
  const name = displayName || "مهمان";

  if ($("headerName")) $("headerName").textContent = name;
  if ($("currentName")) $("currentName").textContent = name;
  if ($("authorAvatar")) $("authorAvatar").textContent = getInitial(name);
}

function openNameModal() {
  $("nameModal")?.classList.remove("hidden");

  if ($("displayNameInput")) {
    $("displayNameInput").value = displayName;
    $("displayNameInput").focus();
  }
}

function closeNameModal() {
  $("nameModal")?.classList.add("hidden");
}

$("nameButton")?.addEventListener("click", openNameModal);
$("changeName")?.addEventListener("click", openNameModal);
$("closeNameModal")?.addEventListener("click", closeNameModal);

$("nameModal")?.addEventListener("click", event => {
  if (event.target === $("nameModal")) closeNameModal();
});

$("nameForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const newName = $("displayNameInput")?.value.trim();

  if (!newName) {
    return setMessage("nameMessage", "لطفاً نام خود را وارد کن.", true);
  }

  if (newName.length > 40) {
    return setMessage("nameMessage", "نام نباید بیشتر از ۴۰ کاراکتر باشد.", true);
  }

  displayName = newName;
  localStorage.setItem(STORAGE_NAME, displayName);

  updateNameUI();
  closeNameModal();
  showToast("نام نمایشی ذخیره شد 💜");
});

/* LOAD TOPICS */

async function loadTopics() {
  if (loadingTopics) return;

  loadingTopics = true;

  const list = $("topicList");
  const empty = $("emptyTopics");

  if (list) {
    list.innerHTML = `
      <div class="loading-card">
        <div class="loader"></div>
        <p>در حال دریافت تاپیک‌ها...</p>
      </div>
    `;
  }

  try {
    const { data, error } = await supabaseClient
      .from("topics")
      .select("id, title, body, author_name, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    topics = data || [];

    if ($("topicCount")) {
      $("topicCount").textContent = topics.length.toLocaleString("fa-IR");
    }

    if (!topics.length) {
      if (list) list.innerHTML = "";
      empty?.classList.remove("hidden");
      await updateCommentCount();
      return;
    }

    empty?.classList.add("hidden");
    await renderTopics();

  } catch (error) {
    console.error("LOAD TOPICS ERROR:", error);

    if (list) {
      list.innerHTML = `
        <div class="loading-card">
          <p>دریافت تاپیک‌ها انجام نشد.</p>
          <small>${escapeHTML(error.message)}</small>
        </div>
      `;
    }

    showToast("خطا در دریافت تاپیک‌ها");
  } finally {
    loadingTopics = false;
  }
}

/* RENDER TOPICS AND COMMENTS */

async function renderTopics() {
  const list = $("topicList");
  if (!list) return;

  if (!topics.length) {
    list.innerHTML = "";
    return;
  }

  const topicIds = topics.map(topic => topic.id);

  const { data: comments, error } = await supabaseClient
    .from("comments")
    .select("id, topic_id, author_name, body, created_at")
    .in("topic_id", topicIds)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const commentsByTopic = new Map();

  (comments || []).forEach(comment => {
    const key = String(comment.topic_id);

    if (!commentsByTopic.has(key)) {
      commentsByTopic.set(key, []);
    }

    commentsByTopic.get(key).push(comment);
  });

  list.innerHTML = topics.map(topic => {
    const topicComments = commentsByTopic.get(String(topic.id)) || [];

    const commentsHTML = topicComments.length
      ? topicComments.map(comment => `
          <div class="comment-item">
            <div class="comment-avatar">
              ${escapeHTML(getInitial(comment.author_name))}
            </div>
            <div class="comment-content">
              <strong>${escapeHTML(comment.author_name || "مهمان")}</strong>
              <p>${escapeHTML(comment.body)}</p>
              <small>${formatDate(comment.created_at)}</small>
            </div>
          </div>
        `).join("")
      : `<p class="no-comments">هنوز کامنتی ثبت نشده است.</p>`;

    return `
      <article class="topic-card" data-topic-id="${escapeHTML(topic.id)}">
        <div class="topic-header">
          <div class="topic-avatar">
            ${escapeHTML(getInitial(topic.author_name))}
          </div>
          <div>
            <div class="topic-author">
              ${escapeHTML(topic.author_name || "مهمان")}
            </div>
            <span class="topic-date">${formatDate(topic.created_at)}</span>
          </div>
        </div>

        <h3>${escapeHTML(topic.title)}</h3>
        <div class="topic-body">${escapeHTML(topic.body)}</div>

        <div class="topic-divider"></div>

        <div class="comments-heading">
          💬 نظرات (${topicComments.length.toLocaleString("fa-IR")})
        </div>

        <div class="comment-list">${commentsHTML}</div>

        <form class="comment-form" data-topic-id="${escapeHTML(topic.id)}">
          <input type="text" name="comment" maxlength="2000"
            placeholder="نظرت رو بنویس..." required>
          <button type="submit">ارسال کامنت</button>
        </form>

        <div class="comment-message" aria-live="polite"></div>
      </article>
    `;
  }).join("");

  if ($("commentCount")) {
    $("commentCount").textContent =
      (comments || []).length.toLocaleString("fa-IR");
  }
}

/* CREATE TOPIC */

$("topicForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!requireName()) return;

  const title = $("topicTitle").value.trim();
  const body = $("topicBody").value.trim();
  const button = $("publishTopic");

  if (!title || !body) {
    return setMessage("topicMessage", "عنوان و متن تاپیک را وارد کن.", true);
  }

  if (title.length > 120 || body.length > 5000) {
    return setMessage("topicMessage", "طول عنوان یا متن بیشتر از حد مجاز است.", true);
  }

  button.disabled = true;
  button.textContent = "در حال انتشار...";

  setMessage("topicMessage", "");

  try {
    const { error } = await supabaseClient
      .from("topics")
      .insert({
        title,
        body,
        author_name: displayName
      });

    if (error) throw error;

    $("topicForm").reset();

    setMessage("topicMessage", "تاپیک با موفقیت منتشر شد 💜");
    showToast("تاپیک منتشر شد!");

    await loadTopics();

    $("topics")?.scrollIntoView({ behavior: "smooth" });

  } catch (error) {
    console.error("CREATE TOPIC ERROR:", error);
    setMessage("topicMessage", error.message || "انتشار تاپیک انجام نشد.", true);
  } finally {
    button.disabled = false;
    button.textContent = "انتشار تاپیک";
  }
});

/* CREATE COMMENT */

$("topicList")?.addEventListener("submit", async event => {
  const form = event.target.closest(".comment-form");
  if (!form) return;

  event.preventDefault();

  if (!requireName()) return;

  const topicId = form.dataset.topicId;
  const input = form.querySelector('input[name="comment"]');
  const button = form.querySelector("button");
  const messageBox = form.nextElementSibling;

  const body = input.value.trim();
  if (!body) return;

  if (body.length > 2000) {
    messageBox.textContent = "کامنت بیش از حد طولانی است.";
    return;
  }

  button.disabled = true;
  button.textContent = "در حال ارسال...";
  messageBox.textContent = "";

  try {
    const { error } = await supabaseClient
      .from("comments")
      .insert({
        topic_id: topicId,
        author_name: displayName,
        body
      });

    if (error) throw error;

    showToast("کامنت ثبت شد 💜");
    await loadTopics();

  } catch (error) {
    console.error("CREATE COMMENT ERROR:", error);
    messageBox.textContent = error.message || "ارسال کامنت انجام نشد.";
  } finally {
    button.disabled = false;
    button.textContent = "ارسال کامنت";
  }
});

/* COMMENT COUNT */

async function updateCommentCount() {
  const { count, error } = await supabaseClient
    .from("comments")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("COMMENT COUNT ERROR:", error);
    return;
  }

  if ($("commentCount")) {
    $("commentCount").textContent =
      (count || 0).toLocaleString("fa-IR");
  }
}

/* REFRESH */

$("refreshBtn")?.addEventListener("click", async () => {
  const button = $("refreshBtn");

  button.disabled = true;
  button.textContent = "در حال دریافت...";

  await loadTopics();

  button.disabled = false;
  button.textContent = "↻ تازه‌سازی";

  showToast("اطلاعات به‌روز شد.");
});

/* MOBILE MENU */

$("menuBtn")?.addEventListener("click", () => {
  $("nav")?.classList.toggle("active");
});

$("nav")?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    $("nav")?.classList.remove("active");
  });
});

/* INITIALIZE */

async function initializeApp() {
  updateNameUI();
  await loadTopics();

  if (!displayName) {
    setTimeout(openNameModal, 500);
  }
}

initializeApp();
    
