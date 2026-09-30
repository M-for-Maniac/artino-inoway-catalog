/* Artino × InoWay PDF export layer
   Builds a dedicated print-ready A4 document in the browser. The user can print or save it as PDF without an external PDF library. */
(function(){
  const EXPORT_ROOT_ID = 'pdf-export-root';
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function textOf(item, field, lang){
    return lang === 'fa' ? (item?.[field+'_fa'] ?? item?.[field] ?? '') : (item?.[field] ?? '');
  }

  function getRoot(){
    let root = document.getElementById(EXPORT_ROOT_ID);
    if(!root){
      root = document.createElement('div');
      root.id = EXPORT_ROOT_ID;
      document.body.appendChild(root);
    }
    return root;
  }

  function ui(lang){
    return lang === 'fa' ? {
      catalog:'کاتالوگ محصولات و راهکارها',
      project:'پروژه مرجع',
      product:'خانواده محصول',
      client:'کارفرما / مجموعه',
      overview:'معرفی',
      gallery:'گالری تصاویر',
      specifications:'مشخصات',
      generated:'تهیه‌شده از کاتالوگ دیجیتال آرتینو × اینووی',
      page:'صفحه',
      allProjects:'پروژه‌های مرجع',
      allProducts:'خانواده محصولات و راهکارها',
      ecosystem:'آرتینو × اینووی',
      download:'چاپ / ذخیره PDF'
    } : {
      catalog:'Product & Solutions Catalog',
      project:'Reference Project',
      product:'Product Family',
      client:'Client / Organization',
      overview:'Overview',
      gallery:'Project Gallery',
      specifications:'Specifications',
      generated:'Generated from the Artino × InoWay digital catalog',
      page:'Page',
      allProjects:'Reference Projects',
      allProducts:'Product & Solution Families',
      ecosystem:'ARTINO × INOWAY',
      download:'Print / Save PDF'
    };
  }

  function titleFor(item, lang){ return textOf(item,'name',lang); }

  function imageBlock(src, alt, index){
    return `<div class="pdf-gallery-item"><img src="${safe(src)}" alt="${safe(alt)}"><div class="pdf-image-number">${String(index).padStart(2,'0')}</div></div>`;
  }

  function baseStyles(lang){
    return `
      <style>
        #${EXPORT_ROOT_ID}{position:absolute;left:0;top:0;width:794px;background:#fff;z-index:99999;direction:${lang==='fa'?'rtl':'ltr'};font-family:${lang==='fa'?'Tahoma,"Segoe UI",Arial,sans-serif':'Arial,Helvetica,sans-serif'};color:#151a1f}
        #${EXPORT_ROOT_ID} *{box-sizing:border-box}
        .pdf-page{width:794px;min-height:1123px;background:#fff;padding:46px 50px 48px;position:relative;break-inside:avoid;page-break-inside:avoid}
        .pdf-cover{display:flex;flex-direction:column;justify-content:space-between;min-height:1025px}
        .pdf-kicker{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#0b9fbe;font-weight:700}
        [dir="rtl"] .pdf-kicker{letter-spacing:.04em}
        .pdf-brand{font-size:15px;font-weight:800;letter-spacing:.12em}
        .pdf-title{font-size:38px;line-height:1.05;margin:22px 0 14px;font-weight:800}
        .pdf-subtitle{font-size:15px;line-height:1.7;color:#69737d;margin:0 0 28px}
        .pdf-meta{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0 26px}
        .pdf-chip{border:1px solid #dce2e6;border-radius:99px;padding:6px 10px;font-size:10px;color:#4f5961}
        .pdf-hero{width:100%;height:360px;object-fit:contain;background:#f4f6f7;border-radius:16px;display:block}
        .pdf-section-title{font-size:21px;margin:0 0 12px;font-weight:800}
        .pdf-body{font-size:12px;line-height:1.8;color:#4d5860}
        .pdf-gallery{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
        .pdf-gallery-item{position:relative;border:1px solid #e0e5e8;border-radius:12px;padding:7px;background:#f7f8f9;break-inside:avoid;page-break-inside:avoid}
        .pdf-gallery-item img{display:block;width:100%;height:235px;object-fit:contain;background:#fff;border-radius:8px}
        .pdf-image-number{font-size:9px;color:#7a858d;margin-top:5px;text-align:${lang==='fa'?'right':'left'};direction:ltr}
        .pdf-footer{position:absolute;left:50px;right:50px;bottom:18px;border-top:1px solid #e3e7e9;padding-top:7px;font-size:8px;color:#7a858d;display:flex;justify-content:space-between;gap:12px}
        .pdf-gallery-page{padding-bottom:50px}
        .pdf-divider{height:1px;background:#dce2e6;margin:24px 0}
        .pdf-specs{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
        .pdf-spec{font-size:9px;border:1px solid #dce2e6;border-radius:99px;padding:5px 8px;color:#5d6870}
        .pdf-full-cover{background:linear-gradient(135deg,#11181d,#26343b);color:#fff}
        .pdf-full-cover .pdf-subtitle,.pdf-full-cover .pdf-body{color:#c8d0d5}
        .pdf-full-cover .pdf-chip{border-color:#53616a;color:#e1e7ea}
        .pdf-full-cover .pdf-footer{border-color:#53616a;color:#c8d0d5}
        .pdf-project-heading{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
        .pdf-project-heading .pdf-title{flex:1}
        .pdf-client{font-size:11px;color:#69737d;margin-top:3px}
        @media print{#${EXPORT_ROOT_ID}{position:static;left:auto;width:100%}}
      </style>`;
  }

  async function waitForImages(root){
    const imgs = [...root.querySelectorAll('img')];
    await Promise.all(imgs.map(img => new Promise(resolve => {
      if(img.complete){
        if(img.decode){img.decode().catch(()=>{}).finally(resolve)} else resolve();
        return;
      }
      img.addEventListener('load',resolve,{once:true});
      img.addEventListener('error',resolve,{once:true});
    })));
  }

  function footer(label, lang){
    const year = new Date().getFullYear();
    return `<div class="pdf-footer"><span>${safe(label)}</span><span>${year}</span></div>`;
  }


  function galleryPages(images, title, u, lang){
    const pages=[];
    for(let start=1; start<images.length; start+=4){
      const chunk=images.slice(start,start+4);
      pages.push(`<div class="pdf-page pdf-gallery-page"><div class="pdf-kicker">${safe(u.gallery)}</div><h2 class="pdf-section-title">${safe(title)}</h2><div class="pdf-gallery">${chunk.map((src,i)=>imageBlock(src,title,start+i+1)).join('')}</div>${footer(u.generated,lang)}</div>`);
    }
    return pages.join('');
  }

  function projectDocument(project, data, lang){
    const u = ui(lang);
    const category = data.categories?.find(c => c.id === project.category);
    const images = Array.isArray(project.images) ? project.images : [];
    const chips = [project.status, category ? textOf(category,'name',lang) : ''].filter(Boolean);
    return `<div class="pdf-page pdf-cover">
      <div>
        <div class="pdf-brand">${u.ecosystem}</div>
        <div class="pdf-kicker">${safe(u.project)}</div>
        <div class="pdf-project-heading"><h1 class="pdf-title">${safe(titleFor(project,lang))}</h1></div>
        ${project.client ? `<div class="pdf-client"><strong>${safe(u.client)}:</strong> ${safe(textOf(project,'client',lang))}</div>` : ''}
        <div class="pdf-meta">${chips.map(c=>`<span class="pdf-chip">${safe(c)}</span>`).join('')}</div>
        ${images[0] ? `<img class="pdf-hero" src="${safe(images[0])}" alt="${safe(titleFor(project,lang))}">` : ''}
        <div class="pdf-divider"></div>
        <h2 class="pdf-section-title">${safe(u.overview)}</h2>
        <p class="pdf-body">${safe(textOf(project,'summary',lang))}</p>
      </div>
      ${footer(u.generated,lang)}
    </div>${galleryPages(images,titleFor(project,lang),u,lang)}`;
  }

  function productDocument(item, data, lang){
    const u = ui(lang);
    const category = data.categories?.find(c => c.id === item.category);
    const images = Array.isArray(item.images) ? item.images : [];
    const specs = lang==='fa' ? (item.specs_fa||item.specs||[]) : (item.specs||[]);
    return `<div class="pdf-page pdf-cover">
      <div>
        <div class="pdf-brand">${u.ecosystem}</div>
        <div class="pdf-kicker">${safe(u.product)}</div>
        <h1 class="pdf-title">${safe(titleFor(item,lang))}</h1>
        <div class="pdf-meta">${[item.status,category?textOf(category,'name',lang):''].filter(Boolean).map(c=>`<span class="pdf-chip">${safe(c)}</span>`).join('')}</div>
        ${images[0] ? `<img class="pdf-hero" src="${safe(images[0])}" alt="${safe(titleFor(item,lang))}">` : ''}
        <div class="pdf-divider"></div>
        <h2 class="pdf-section-title">${safe(u.overview)}</h2>
        <p class="pdf-body">${safe(textOf(item,'summary',lang))}</p>
        ${specs.length ? `<h2 class="pdf-section-title" style="margin-top:20px">${safe(u.specifications)}</h2><div class="pdf-specs">${specs.map(s=>`<span class="pdf-spec">${safe(s)}</span>`).join('')}</div>`:''}
      </div>
      ${footer(u.generated,lang)}
    </div>${galleryPages(images,titleFor(item,lang),u,lang)}`;
  }

  function fullCatalogDocument(data, lang){
    const u = ui(lang);
    const companyPages = (data.companies||[]).map(c => `<div class="pdf-page"><div class="pdf-kicker">${safe(u.catalog)}</div><h1 class="pdf-title">${safe(textOf(c,'name',lang))}</h1><h2 class="pdf-section-title">${safe(textOf(c,'role',lang))}</h2><p class="pdf-body">${safe(textOf(c,'intro',lang))}</p><div class="pdf-divider"></div><div class="pdf-gallery">${(data.categories||[]).filter(x=>x.company===c.id).map(x=>`<div class="pdf-gallery-item" style="padding:18px;background:#fff"><h3 style="margin:0 0 8px;font-size:15px">${safe(textOf(x,'name',lang))}</h3><p class="pdf-body" style="margin:0">${safe(textOf(x,'description',lang))}</p></div>`).join('')}</div>${footer(u.generated,lang)}</div>`).join('');
    const itemPages = (data.items||[]).map(item=>productDocument(item,data,lang)).join('');
    const projectPages = (data.projects||[]).map(project=>projectDocument(project,data,lang)).join('');
    return `<div class="pdf-page pdf-full-cover pdf-cover"><div><div class="pdf-brand">${u.ecosystem}</div><div class="pdf-kicker">${safe(u.catalog)}</div><h1 class="pdf-title">${safe(data.settings?.[lang==='fa'?'title_fa':'title'])}</h1><p class="pdf-subtitle">${safe(data.settings?.[lang==='fa'?'subtitle_fa':'subtitle'])}</p><div class="pdf-meta"><span class="pdf-chip">${safe(data.settings?.[lang==='fa'?'edition_fa':'edition'])}</span><span class="pdf-chip">${safe(u.allProducts)}</span><span class="pdf-chip">${safe(u.allProjects)}</span></div><img class="pdf-hero" src="images/cover-hero.jpg" alt="${safe(u.catalog)}"></div>${footer(u.generated,lang)}</div>${companyPages}${itemPages}${projectPages}`;
  }

  async function generate(html, filename, lang){
    const root = getRoot();
    const originalTitle = document.title;
    const u = ui(lang);
    root.innerHTML = baseStyles(lang) + html;
    root.setAttribute('dir',lang==='fa'?'rtl':'ltr');
    root.style.display='block';
    root.setAttribute('aria-hidden','false');
    document.body.classList.add('pdf-printing');
    document.title = filename.replace(/\.pdf$/i,'');
    await waitForImages(root);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    return new Promise(resolve => {
      let finished = false;
      const cleanup = () => {
        if(finished) return;
        finished = true;
        document.body.classList.remove('pdf-printing');
        root.style.display='none';
        root.setAttribute('aria-hidden','true');
        root.innerHTML='';
        document.title=originalTitle;
        window.removeEventListener('afterprint',cleanup);
        resolve();
      };
      window.addEventListener('afterprint',cleanup,{once:true});
      window.print();
      // Some browsers do not fire afterprint when printing is cancelled.
      setTimeout(cleanup,1500);
    });
  }

  window.PDF_EXPORTER = {
    project:(project,data,lang)=>generate(projectDocument(project,data,lang),`Artino-InoWay_${project.id}_${lang}.pdf`,lang),
    product:(item,data,lang)=>generate(productDocument(item,data,lang),`Artino-InoWay_${item.id}_${lang}.pdf`,lang),
    catalog:(data,lang)=>generate(fullCatalogDocument(data,lang),`Artino-InoWay_Catalog_v${data.version}_${lang}.pdf`,lang)
  };
})();
