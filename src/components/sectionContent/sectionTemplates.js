
const portfolioItems = [
    { title: 'Aegis',   desc: 'Mech Roguelike created in Unity, completed at Georgia Tech alongside 4 other students within 2 months. Focused on enemy AI, 3D modelling and texturing, and created entire attack system.', img: '/Images/Aegis.webp', link: 'https://youtu.be/ergm2NkF3yc' },
    { title: 'nanosgarage.com',   desc: 'This site was created using THREE JS, and a gooey like shader created by me. It uses the signed distance fields, a super cool concept I learnt via my computer graphics courses. Click on this project to see the code for the site.', img: '/Images/favicon.webp', link: 'https://github.com/nanosgarage/portfolio' },
    { title: 'Animal Crossing Chatbox', desc: 'Super simple twitch chatbox that looks identical to the chat boxes in animal crossing. Still working on implementing all 3rd party twitch emotes.', img: '', link: 'https://github.com/nanosgarage/AnimalCrossingChatbox' },
    { title: 'Dracula Bot',  desc: 'Discord bot that lets you connect to any API and talk to dracula in your discord server. Made as a joke but kinda fun. Uses the DPP library.', img: '/Images/drac.webp', link: 'https://github.com/nanosgarage/DraculaBot' },
    { title: 'Deadlock Motion Graphic',  desc: 'Handmade animation for deadlock characters using my signature vector artstyle. Made in After Effects and Blender.', img: '/Images/DL.webp', link: 'https://x.com/nanosgarage/status/2092283466360771033?s=20' },
    { title: '3D vfx workflow for Youtube Editors',   desc: 'Blender tutorial showcasing how editors on youtube can work with lesss than ideal 3D vfx conditions, and still implement 3D into their work.', img: '/Images/3dEdits.webp', link: 'https://www.youtube.com/watch?v=6MEFe-k45uw' },
    { title: 'Cold Ones Videos', desc: "I've worked with Cold Ones to create 24 episodes. This playlist includes all the work I've done for them.", img: '/Images/coldones.webp', link: 'https://www.youtube.com/watch?v=VPODr7JDU3w&list=PLch4sLhlMtI4'},
    { title: 'Blender addon: Project Setter Upper', desc: 'Blender add-on that allows for quick setup of project hierarchies.', img: '/Images/Blender.webp', link: 'https://github.com/nanosgarage/ProjectSetterUpper' }
];

const downloads = [
    /*{ label: 'Resume (PDF)',     size: '120 KB', href: '/downloads/resume.pdf' },
    { label: 'Demo Reel (MP4)',  size: '48 MB',  href: '/downloads/reel.mp4' },
    { label: 'Shader Pack (ZIP)', size: '3 MB',  href: '/downloads/shaders.zip' },*/
];

const CONTACT_EMAIL = 'ngarge@pm.me';

export const SECTION_CONTENT = {
    portfolio: {
        title: 'Portfolio',
        html: `
            <div class="grid">
                ${portfolioItems.map((p) => `
                    <a class="card" href="${p.link}" target="_blank" rel="noopener">
                        ${p.img ? `<img class="thumb" src="${p.img}" alt="">` : `<div class="thumb"></div>`}
                        <h3>${p.title}</h3>
                        <p>${p.desc}</p>
                    </a>
                `).join('')}
            </div>
        `,
    },

    downloads: {
        title: 'Downloads',
        html: `
            <ul class="download-list">
                ${downloads.map((d) => `
                    <li><a href="${d.href}" download><span>${d.label}</span><span>${d.size}</span></a></li>
                `).join('')}
            </ul>
        `,
    },

    about: {
        title: 'About',
        html: `
            <h3>Professional Career and Skills</h3> 
            <p>Professionally I'm a video editor / VFX artist / motion graphics designer / 3D modeller / texture artist. I try to wear a lot of hats basically. <br></p>
            <p><br>Whether or not that's helped me progress is up for debate, but it's definitely made me realize my ambition towards become a technical artist and becoming a master in my field.</p>
            <p><br>In terms of clients, I've worked primarily on youtube for 8 years, helping various creators release competent, high quality videos that help seperate them from others. If you're looking for work of that caliber, please get in contact!</p>
            <p>I'm also currently employed by Cold Ones, and have been so for around 2 years.</p>
            <h3><br>Professional Timeline (excluding freelance)</h3>
            <p>ImmortalHD -> Offcanny -> Alpharad -> Cold Ones</p>
            <h3><br>Education</h3>
            <p> I'm currently enrolled at The Georgia Institute of Technology, where I'm completing my masters degree in Computer Science specializing in computer graphics.</p>
            <p> I completed my undergrad in history (weird given my current pursuits right?) at University of California, Los Angeles.</p>
            <p> I have zero formal education in video editing and digital creation, I let my existing work speak for itself. </p>
        `,
    },

    contact: {
        title: 'Contact',
        html: `
            <p>Note: I reply fastest via discord, so feel free to add me on there and let me know what you're looking for (if you just say hello I likely will treat it as spam). <br>
            My discord is @sdreadnoug <br></p>
            <br>
            <p>Otherwise, fill out the form below and I will get back to you via email asap!<br><p>
            <form class="contact-form" data-to="${CONTACT_EMAIL}">
                <input name="name" placeholder="Name" required>
                <input name="email" type="email" placeholder="Email" required>
                <textarea name="message" placeholder="Message" required></textarea>
                <button type="submit">Send</button>
            </form>
        `,
    },
};