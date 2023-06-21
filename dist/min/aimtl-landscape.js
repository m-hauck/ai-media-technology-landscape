"use strict";(()=>{var m=document.querySelector("dialog"),M=document.querySelector("dialog #modal-close-button"),b={name:"Name",manufacturer:"Company",logo:"Logo",link:"Link",mediatype:"Media type",description:"Description",technologyReadinessLevel:"Technology Readiness Level",aiTechnologiesUsed:"AI technologies used",categories:"Categories",paymentModel:"Payment Model",companyLocation:"Company headquarters",funding:"Funding",revenuePerYear:"Revenue",notes:"Notes"};function v(e){return e.split(",").map(t=>t.trim().charAt(0).toUpperCase()+t.trim().slice(1)).join(", ")}function P(e){return e.split("-").map(t=>t.charAt(0).toUpperCase()+t.slice(1)).join(" ")}function h(){let e=document.querySelector("#modal #modal-grid");for(let[t,n]of Object.entries(b)){if(t=="logo")continue;let o=document.createElement("div");o.dataset[t+"Name"]="",o.innerText=n,e?.appendChild(o);let r=document.createElement("div");r.dataset[t+"Content"]="",e?.appendChild(r)}}function u(e,t){let n=t.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();m.querySelector(`[data-${n}-content]`).innerText=e.getAttribute(`data-${n}`)||"";let o="initial";(e.getAttribute(`data-${n}`)==null||e.getAttribute(`data-${n}`)=="")&&(o="none"),m.querySelector(`[data-${n}-name]`).style.display=o,m.querySelector(`[data-${n}-content]`).style.display=o}function E(e,t){if(e==null||!(e instanceof HTMLElement))return;let n=document.querySelector("#modal");for(let[o,r]of Object.entries(b))switch(o){case"logo":n.querySelector("[data-logo]").src=`img/${e.getAttribute("data-logo")}`;break;case"link":n.querySelector("[data-link-content]").innerHTML=`<a href="${e.getAttribute("data-link")}" target="_blank" title="Open external link to '${e.getAttribute("data-name")}'">${e.getAttribute("data-link")}</a>`;break;case"mediatype":e.dataset.mediatype=v(e.getAttribute("data-mediatype")),u(e,o);break;case"technologyReadinessLevel":e.dataset.technologyReadinessLevel=P(e.getAttribute("data-technology-readiness-level")),u(e,o);break;case"categories":if(e.dataset.categoriesUpdated!=null){u(e,o);break}let a=e.getAttribute("data-categories").split(","),s=[];a.forEach(c=>{let[g,d]=c.split("_");s.push(t[g].description),d&&s.push(t[g].subcategories[d].description)}),e.dataset.categories=s.join(", "),e.dataset.categoriesUpdated="true",u(e,o);break;case"paymentModel":if(e.dataset.paymentModelUpdated!=null){u(e,o);break}let i=e.getAttribute("data-payment-model").split(",");e.dataset.paymentModel=p[e.getAttribute("data-payment-model")];let l=[];i.forEach(c=>{l.push(p[c])}),e.dataset.paymentModel=l.join(", "),e.dataset.paymentModelUpdated="true",u(e,o);break;default:u(e,o)}n.showModal()}function f(e){(e.target===m||e.target instanceof HTMLElement&&e.target.id==="modal-close-button")&&m.close()}function H(){m.addEventListener("click",f),M.addEventListener("click",f)}H();var p={free:"Free",freemium:"Freemium","paid-once":"Paid once","paid-with-premium-extra":"Paid with premium extras","paid-periodically":"Paid periodically","contact-for-pricing":"Contact for Pricing"};function q(){let e=document.querySelectorAll(".product"),t=0;e.forEach(n=>{let o=n.getBoundingClientRect().height;o>t&&(t=o)}),e.forEach(n=>{n.style.minHeight=`${t}px`})}function k(e){if(e==null)return{};let t=Object.keys(e).sort((o,r)=>o.localeCompare(r)),n={};return t.forEach(o=>{n[o]=e[o]}),n}function L(e){return new Promise((t,n)=>{let o=new XMLHttpRequest;o.onreadystatechange=()=>{o.readyState===XMLHttpRequest.DONE&&(o.status!==200&&n(),t(JSON.parse(o.responseText)))},o.open("GET",e,!0),o.send()})}function T(e){let t=document.querySelectorAll(`${e} .product:not([style*='display: none'])`),n=new Set;return t.forEach(o=>{let r=o.innerText.trim();n.add(r)}),n.size.toString()}function S(e){for(let[t]of Object.entries(e))document.querySelector(`#${t} .count-product`).innerText=T(`#${t}`);document.querySelector("#count-number").innerText=T("#row-products")}function A(){document.querySelector("#counter-total")?.classList.remove("invisible"),document.querySelector("#unavailable-products-switch")?.classList.remove("invisible")}function x(e,t){t.forEach(n=>{n.categories.forEach(r=>{let[a,s]=r.split("_");n.technologyReadinessLevelClass=n.technologyReadinessLevel==null?"trl-unknown":`trl-${n.technologyReadinessLevel}`,n.mediatypeClass=n.mediatype.length>1?"mediatype-mixed":`mediatype-${n.mediatype}`,s!=null?e[a].subcategories[s].products.push(n):e[a].products.push(n),e[a].products.sort((i,l)=>i.name<l.name?-1:i.name>l.name?1:0)})})}function C(e,t,n){if(t==null)return;let o=document.querySelector("#product-template");e.forEach(a=>{let s=o.content.cloneNode(!0),i=s.querySelector("li"),l=s.querySelector("img"),c=s.querySelector(".product-manufacturer"),g=s.querySelector(".product-name");i.classList.add(a.technologyReadinessLevelClass,a.mediatypeClass),l.alt=a.name,l.src=`img/${a.logo}`,a.name!=a.manufacturer&&(c.innerText=a.manufacturer),g.innerText=a.name,a.productAvailable=="false"&&i.classList.add("product-unavailable"),a.paymentModel.forEach(d=>{let y=document.createElement("div");y.classList.add("payment-model"),y.innerText=p[d],s.querySelector(".product-content").appendChild(y)});for(let[d,y]of Object.entries(a))a.hasOwnProperty(d)&&(i.dataset[d]=a[d].toString());t.append(s)}),document.querySelectorAll(".product").forEach(a=>{a.addEventListener("click",s=>{E(s.currentTarget,n)})})}function $(e){for(let[t]of Object.entries(e)){let n=`
        <div class="category" id="${t}">
            <h2 class="category-header">
                ${e[t].description} <span class="counter-text"><span class="count-product">0</span> products</span>
            </h2>
            <ul class="product-list" id="list-${t}"></ul>
        </div>`;document.querySelector("#row-products").innerHTML+=n,C(e[t].products,document.querySelector(`#${t} ul`),e);let o=e[t].subcategories,r=k(o);for(let[a,s]of Object.entries(r)){let i=document.createElement("div");if(i.classList.add("subcategory","card-subtitle","mb-2","text-muted"),a==null){console.log(a),console.log("now");continue}console.log(a),i.id=a,document.querySelector(`#${t}`)?.appendChild(i);let l=document.createElement("h3");l.classList.add("subcategory-header"),l.innerText=s.description,i.appendChild(l);let c=document.createElement("ul");c.classList.add("product-list"),c.id=a,document.querySelector(`#${a}`)?.appendChild(c),C(e[t].subcategories[a].products,document.querySelector(`#${a} .product-list`),e)}A()}}function R(e){let t=document.querySelector(".switch input"),n=document.querySelectorAll(".product-unavailable");t?.addEventListener("change",()=>{let o="";t.checked?o="flex":o="none",n.forEach(r=>{r.style.display=o}),S(e)})}console.clear();Promise.all([L("data/categories.json"),L("data/products.json")]).then(e=>{let[t,n]=e;t==null||n==null||(x(t,n),$(t),S(t),h(),q(),R(t))}).catch(e=>console.error(`Could not load values. ${e.stack}`));})();
