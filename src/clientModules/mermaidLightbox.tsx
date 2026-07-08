import { useEffect } from 'react';

export default function MermaidLightbox(): null {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mermaid-lightbox-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        z-index: 9999;
        justify-content: center;
        align-items: center;
        cursor: zoom-out;
      }
      .mermaid-lightbox-overlay.active {
        display: flex;
      }
      .mermaid-lightbox-box {
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
        background: var(--ifm-background-surface-color);
        border-radius: 8px;
        padding: 24px;
        position: relative;
        cursor: default;
      }
      .mermaid-lightbox-box svg {
        max-width: none !important;
        height: auto !important;
        transition: transform 0.15s ease;
      }
      .mermaid-lightbox-toolbar {
        position: fixed;
        top: 16px;
        right: 16px;
        display: flex;
        gap: 8px;
        z-index: 10000;
      }
      .mermaid-lightbox-toolbar button {
        background: var(--ifm-color-primary);
        color: white;
        border: none;
        border-radius: 6px;
        width: 36px;
        height: 36px;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mermaid-lightbox-toolbar button:hover {
        opacity: 0.85;
      }
      .docusaurus-mermaid-container {
        cursor: zoom-in !important;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'mermaid-lightbox-overlay';
    overlay.innerHTML = `
      <div class="mermaid-lightbox-toolbar">
        <button data-action="zoom-in" title="Zoom in">+</button>
        <button data-action="zoom-out" title="Zoom out">−</button>
        <button data-action="reset" title="Reset">↺</button>
        <button data-action="close" title="Close">✕</button>
      </div>
      <div class="mermaid-lightbox-box"></div>
    `;
    document.body.appendChild(overlay);

    const box = overlay.querySelector('.mermaid-lightbox-box')!;
    let scale = 1;

    function applyScale() {
      const svg = box.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${scale})`;
        svg.style.transformOrigin = 'center center';
      }
    }

    overlay.querySelector('[data-action="zoom-in"]')!.addEventListener('click', (e) => {
      e.stopPropagation();
      scale = Math.min(scale + 0.25, 3);
      applyScale();
    });

    overlay.querySelector('[data-action="zoom-out"]')!.addEventListener('click', (e) => {
      e.stopPropagation();
      scale = Math.max(scale - 0.25, 0.25);
      applyScale();
    });

    overlay.querySelector('[data-action="reset"]')!.addEventListener('click', (e) => {
      e.stopPropagation();
      scale = 1;
      applyScale();
    });

    overlay.querySelector('[data-action="close"]')!.addEventListener('click', () => {
      overlay.classList.remove('active');
      scale = 1;
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        scale = 1;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        scale = 1;
      }
    });

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const mermaidContainer = target.closest('.docusaurus-mermaid-container');
      if (!mermaidContainer) return;

      e.preventDefault();
      e.stopPropagation();

      const clone = mermaidContainer.cloneNode(true) as HTMLElement;
      box.innerHTML = '';
      box.appendChild(clone);
      scale = 1;
      overlay.classList.add('active');
    }

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      style.remove();
      overlay.remove();
    };
  }, []);

  return null;
}
