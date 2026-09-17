/* =========================================
NikiFamily
Supabase
========================================= */

const SUPABASE_URL =
"https://fdazgbcyeiiccbjmxsjo.supabase.co";

const SUPABASE_KEY =
"sb_publishable_rvZELhuZqlk9e6SFuuu9rQ_f_9a665h";

/* =========================================
CONNECTION
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
    .order(
        "created_at",
        {
            ascending: false
        }
    );


if (error) {

    console.error(
        "Supabase Load Error:",
        error
    );

    topicsList.innerHTML = `
        <div class="error">
            دریافت تاپیک‌ها انجام نشد.
            <br>
            لطفاً دوباره تلاش کنید.
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

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "topic-card";


    const title =
        document.createElement("h3");

    title.textContent =
        topic.title ||
        "بدون عنوان";


    const description =
        document.createElement("p");

    description.textContent =
        topic.description ||
        "";


    const date =
        document.createElement("span");

    date.className =
        "topic-date";


    if (topic.created_at) {

        const dateObject =
            new Date(
                topic.created_at
            );

        date.textContent =
            "زمان ایجاد: " +
            dateObject.toLocaleString(
                "fa-IR"
            );
    }


    card.appendChild(title);

    card.appendChild(description);

    card.appendChild(date);

    topicsList.appendChild(card);

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

message.textContent = "";


const { error } =
    await db
    .from("topics")
    .insert({
        title: title,
        description: description
    });


if (error) {

    console.error(
        "Supabase Insert Error:",
        error
    );

    message.textContent =
        "ساخت تاپیک انجام نشد.";

    message.style.color =
        "#b91c1c";

} else {

    message.textContent =
        "تاپیک با موفقیت ساخته شد 💜";

    message.style.color =
        "#16a34a";


    topicTitle.value = "";

    topicDescription.value = "";


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
