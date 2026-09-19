/* =========================================
NikiFamily
Supabase Connection
========================================= */

const SUPABASE_URL =
"https://fdazgbcyeiiccbjmxsjo.supabase.co";

const SUPABASE_KEY =
"sb_publishable_rvZELhuZqlk9e6SFuuu9rQ_f_9a665h";

/* =========================================
CONNECT
========================================= */

const { createClient } = supabase;

const db = createClient(
SUPABASE_URL,
SUPABASE_KEY
);

/* =========================================
ELEMENTS
========================================= */

const topicTitle =
document.getElementById("topicTitle");

const topicDescription =
document.getElementById("topicDescription");

const createTopicBtn =
document.getElementById("createTopicBtn");

const topicsList =
document.getElementById("topicsList");

const message =
document.getElementById("message");

const refreshBtn =
document.getElementById("refreshBtn");

/* =========================================
LOAD COMMENTS
========================================= */

async function loadComments(topicId, commentList) {

const { data, error } = await db
    .from("comments")
    .select("id, topic_id, name, content, created_at")
    .eq("topic_id", topicId)
    .order("created_at", {
        ascending: true
    });

if (error) {

    console.error(
        "Comments load error:",
        error
    );

    commentList.innerHTML = `
        <div class="no-comments">
            دریافت کامنت‌ها انجام نشد.
        </div>
    `;

    return;
}

if (!data || data.length === 0) {

    commentList.innerHTML = `
        <div class="no-comments">
            هنوز کامنتی ثبت نشده است.
        </div>
    `;

    return;
}

commentList.innerHTML = "";

data.forEach(comment => {

    const item =
        document.createElement("div");

    item.className =
        "comment-item";


    const name =
        document.createElement("span");

    name.className =
        "comment-name";

    name.textContent =
        comment.name || "کاربر";


    const content =
        document.createElement("div");

    content.className =
        "comment-content";

    content.textContent =
        comment.content || "";


    const date =
        document.createElement("span");

    date.className =
        "comment-date";


    if (comment.created_at) {

        const dateObject =
            new Date(comment.created_at);

        date.textContent =
            dateObject.toLocaleString("fa-IR");
    }


    item.appendChild(name);
    item.appendChild(content);
    item.appendChild(date);

    commentList.appendChild(item);

});

}

/* =========================================
CREATE COMMENT
========================================= */

async function createComment(
topicId,
nameInput,
contentInput,
commentBtn,
commentMessage,
commentList
) {

const name =
    nameInput.value.trim();

const content =
    contentInput.value.trim();


/* Check name */

if (!name) {

    commentMessage.textContent =
        "لطفاً نام خود را وارد کنید.";

    commentMessage.style.color =
        "#b91c1c";

    nameInput.focus();

    return;
}


/* Check content */

if (!content) {

    commentMessage.textContent =
        "لطفاً متن کامنت را وارد کنید.";

    commentMessage.style.color =
        "#b91c1c";

    contentInput.focus();

    return;
}


commentBtn.disabled =
    true;

commentBtn.textContent =
    "در حال ارسال...";

commentMessage.textContent =
    "";


/* =====================================
   INSERT COMMENT
===================================== */

const { data, error } = await db
    .from("comments")
    .insert({
        topic_id: topicId,
        name: name,
        content: content
    })
    .select();


/* =====================================
   ERROR
===================================== */

if (error) {

    console.error(
        "Comment insert error:",
        error
    );

    console.error(
        "Error code:",
        error.code
    );

    console.error(
        "Error message:",
        error.message
    );

    console.error(
        "Error details:",
        error.details
    );

    console.error(
        "Error hint:",
        error.hint
    );


    /* نمایش خطای واقعی */

    commentMessage.textContent =
        "خطا: " +
        (error.message || "خطای نامشخص");


    commentMessage.style.color =
        "#b91c1c";

}

/* =====================================
   SUCCESS
===================================== */

else {

    console.log(
        "Comment inserted:",
        data
    );

    commentMessage.textContent =
        "کامنت با موفقیت ثبت شد 💜";

    commentMessage.style.color =
        "#16a34a";


    nameInput.value =
        "";

    contentInput.value =
        "";


    await loadComments(
        topicId,
        commentList
    );

}


commentBtn.disabled =
    false;

commentBtn.textContent =
    "💬 ارسال کامنت";

}

/* =========================================
LOAD TOPICS
========================================= */

async function loadTopics() {

topicsList.innerHTML = `
    <div class="loading">
        در حال دریافت تاپیک‌ها...
    </div>
`;


const { data, error } = await db
    .from("topics")
    .select(
        "id, title, description, created_at"
    )
    .order("created_at", {
        ascending: false
    });


if (error) {

    console.error(
        "Load topics error:",
        error
    );

    topicsList.innerHTML = `
        <div class="error">
            دریافت تاپیک‌ها انجام نشد.
            <br>
            دسترسی جدول را در Supabase بررسی کنید.
        </div>
    `;

    return;
}


if (!data || data.length === 0) {

    topicsList.innerHTML = `
        <div class="empty">
            هنوز هیچ تاپیکی ساخته نشده است 💜
        </div>
    `;

    return;
}


topicsList.innerHTML = "";


data.forEach(topic => {

    /* =================================
       TOPIC CARD
    ================================= */

    const card =
        document.createElement("article");

    card.className =
        "topic-card";


    /* Title */

    const title =
        document.createElement("h3");

    title.textContent =
        topic.title ||
        "بدون عنوان";


    /* Description */

    const description =
        document.createElement("p");

    description.textContent =
        topic.description ||
        "";


    /* Date */

    const date =
        document.createElement("span");

    date.className =
        "topic-date";


    if (topic.created_at) {

        const dateObject =
            new Date(topic.created_at);

        date.textContent =
            "زمان ایجاد: " +
            dateObject.toLocaleString("fa-IR");
    }


    /* =================================
       COMMENTS SECTION
    ================================= */

    const commentsSection =
        document.createElement("div");

    commentsSection.className =
        "comments-section";


    /* Comments title */

    const commentsTitle =
        document.createElement("h4");

    commentsTitle.className =
        "comments-title";

    commentsTitle.textContent =
        "💬 نظرات";


    /* Comment list */

    const commentList =
        document.createElement("div");

    commentList.className =
        "comment-list";

    commentList.innerHTML = `
        <div class="loading">
            در حال دریافت کامنت‌ها...
        </div>
    `;


    /* =================================
       COMMENT FORM
    ================================= */

    const commentForm =
        document.createElement("div");

    commentForm.className =
        "comment-form";


    /* Name */

    const nameInput =
        document.createElement("input");

    nameInput.type =
        "text";

    nameInput.maxLength =
        50;

    nameInput.placeholder =
        "نام شما";

    nameInput.autocomplete =
        "off";


    /* Content */

    const contentInput =
        document.createElement("textarea");

    contentInput.maxLength =
        1000;

    contentInput.placeholder =
        "کامنت خود را بنویسید...";


    /* Button */

    const commentBtn =
        document.createElement("button");

    commentBtn.type =
        "button";

    commentBtn.className =
        "comment-btn";

    commentBtn.textContent =
        "💬 ارسال کامنت";


    /* Message */

    const commentMessage =
        document.createElement("p");

    commentMessage.className =
        "comment-message";


    /* =================================
       BUTTON EVENT
    ================================= */

    commentBtn.addEventListener(
        "click",
        () => {

            createComment(
                topic.id,
                nameInput,
                contentInput,
                commentBtn,
                commentMessage,
                commentList
            );

        }
    );


    /* =================================
       BUILD COMMENT FORM
    ================================= */

    commentForm.appendChild(
        nameInput
    );

    commentForm.appendChild(
        contentInput
    );

    commentForm.appendChild(
        commentBtn
    );

    commentForm.appendChild(
        commentMessage
    );


    /* =================================
       BUILD COMMENTS SECTION
    ================================= */

    commentsSection.appendChild(
        commentsTitle
    );

    commentsSection.appendChild(
        commentList
    );

    commentsSection.appendChild(
        commentForm
    );


    /* =================================
       BUILD TOPIC CARD
    ================================= */

    card.appendChild(
        title
    );

    card.appendChild(
        description
    );

    card.appendChild(
        date
    );

    card.appendChild(
        commentsSection
    );


    topicsList.appendChild(
        card
    );


    /* Load comments */

    loadComments(
        topic.id,
        commentList
    );

});

}

/* =========================================
CREATE TOPIC
========================================= */

async function createTopic() {

const title =
    topicTitle.value.trim();

const description =
    topicDescription.value.trim();


if (!title) {

    message.textContent =
        "لطفاً عنوان تاپیک را وارد کنید.";

    message.style.color =
        "#b91c1c";

    topicTitle.focus();

    return;
}


if (!description) {

    message.textContent =
        "لطفاً متن تاپیک را وارد کنید.";

    message.style.color =
        "#b91c1c";

    topicDescription.focus();

    return;
}


createTopicBtn.disabled =
    true;

createTopicBtn.textContent =
    "در حال ساخت...";

message.textContent =
    "";


const { error } = await db
    .from("topics")
    .insert({
        title: title,
        description: description
    });


if (error) {

    console.error(
        "Topic insert error:",
        error
    );

    message.textContent =
        "ساخت تاپیک انجام نشد.";

    message.style.color =
        "#b91c1c";

}

else {

    message.textContent =
        "تاپیک با موفقیت ساخته شد 💜";

    message.style.color =
        "#16a34a";


    topicTitle.value =
        "";

    topicDescription.value =
        "";


    await loadTopics();

}


createTopicBtn.disabled =
    false;

createTopicBtn.textContent =
    "+ ساخت تاپیک";

}

/* =========================================
BUTTONS
========================================= */

createTopicBtn.addEventListener(
"click",
createTopic
);

refreshBtn.addEventListener(
"click",
loadTopics
);

/* =========================================
START
========================================= */

loadTopics();
