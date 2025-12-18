class TMAnimatedLogo extends HTMLElement {
  static get observedAttributes() { return ["accent", "secondary", "stroke", "shimmer", "hover"]; }
  constructor(){
    super();
    this.attachShadow({mode:"open"});
    this._prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  connectedCallback(){
    const accent = this.getAttribute("accent") || "#00E5A8";
    const secondary = this.getAttribute("secondary") || "#7DF3FF";
    const stroke = this.getAttribute("stroke") || "#0f172a";
    const shimmer = this.getAttribute("shimmer") !== "false";

    this.shadowRoot.innerHTML = `
    <style>
      :host { display:inline-block; contain:content; }
      .wrap { width:100%; height:100%; perspective:800px; }

      /* ✅ overflow:visible prevents stroke shave at tiny sizes */
      .tm-logo {
        width:100%; height:100%;
        overflow: visible;
        filter: drop-shadow(0 6px 14px rgba(15,23,42,0.15));
        transform-style:preserve-3d;
        transition: transform 400ms cubic-bezier(.2,.8,.2,1), filter 300ms ease;
      }
      :host([hover]) .tm-logo:hover {
        transform: translateY(-2px) rotateX(2deg);
        filter: drop-shadow(0 10px 22px rgba(15,23,42,0.22));
      }

      .tm-stroke {
        stroke-dasharray: var(--path-length, 1400);
        stroke-dashoffset: var(--path-length, 1400);
        animation: tm-draw 1.4s cubic-bezier(.65,.05,.36,1) forwards;
      }
      @keyframes tm-draw { to { stroke-dashoffset: 0; } }

      .tm-fill { opacity: 0; animation: tm-fill 900ms ease forwards; animation-delay: 950ms; }
      @keyframes tm-fill { to { opacity: 1; } }

      .tm-shimmer { opacity: 0.6; mix-blend-mode: screen; }
      .tm-sheen { animation: tm-sheen 3.5s linear infinite; }
      @keyframes tm-sheen {
        from { transform: translateX(-120%) skewX(-20deg); }
        to   { transform: translateX(120%) skewX(-20deg); }
      }

      :host(.paused) .tm-stroke, :host(.paused) .tm-fill, :host(.paused) .tm-sheen {
        animation-play-state: paused !important;
      }
      :host(.reduced) .tm-stroke, :host(.reduced) .tm-fill, :host(.reduced) .tm-sheen {
        animation: none !important;
      }
    </style>

    <div class="wrap">
      <svg class="tm-logo" viewBox="-2.5 -2.5 93.343643 86.19191" role="img" aria-label="Turbomini hummingbird logo">
        <defs>
          <linearGradient id="tm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accent}" />
            <stop offset="50%" stop-color="${secondary}" />
            <stop offset="100%" stop-color="${accent}" />
          </linearGradient>

          <clipPath id="tm-clip">
            <!-- ✅ apply original translate to clip geometry -->
            <path id="tm-path-clip" transform="translate(-8.8792699,-11.699063)"
              d="m 50.349392,11.831373 c -10.706181,0.01064 -20.268883,4.53423 -27.607617,13.06484 l 5.665287,2.79311 c 20.485986,-18.8695004 43.236536,-6.3299 49.633142,4.62814 l 6.78254,-0.31936 c -3.12332,-6.28395 -13.254868,-19.70478 -32.316894,-20.10833 -0.72359,-0.03956 -1.442713,-0.05911 -2.156458,-0.0584 z M 9.0170309,22.821403 c -0.400657,28.31751 21.2946271,35.79226 27.9285281,36.94555 -6.610619,5.38082 -8.316829,11.09056 -9.176701,17.07647 -5.78368,-6.09471 -8.201107,-13.48435 -8.458398,-21.70462 l -5.585706,-6.304 c -0.108855,8.63353 -0.08697,14.52749 2.25671,20.16156 18.803299,45.201987 82.40857,19.92794 72.91131,-25.82685 l -5.26686,2.07481 c 2.01344,6.35659 -0.81848,22.99654 -10.967289,32.12724 -11.883393,10.69129 -31.962697,12.77478 -38.426079,1.38699 -0.982085,-4.22289 1.290869,-8.41104 2.672189,-10.82879 3.279391,-5.74003 9.366187,-8.76553 13.047265,-10.07794 1.794304,-4.04299 1.616088,-8.08599 1.117245,-12.12898 4.029723,-12.89332 12.490205,-13.37342 18.592663,-4.78782 l 4.388363,-0.47852 c -5.044668,4.60933 -4.827386,2.37105 -7.281726,8.69352 -1.348775,3.47451 -1.511265,7.23458 -2.966744,10.53114 -3.138386,7.10825 -8.794416,12.6435 -20.711914,12.6137 0.9579,1.68284 1.301101,3.58908 4.468461,4.46846 10.684208,0.92596 21.444616,-10.43436 22.729362,-17.93482 1.695699,-9.89965 1.867653,-16.07654 26.903784,-21.48396 -8.03276,-1.96409 -16.06603,-1.22075 -24.098787,-1.67586 -1.500832,-1.3732 -7.805286,-7.70327 -15.057479,-5.66633 -5.010212,1.40725 -8.308832,4.02072 -11.115084,11.65097 -7.321841,-7.44236 -16.452753,-9.79742 -24.946798,-13.71441 -5.252336,-2.42207 -7.636009,-3.31735 -12.9563151,-5.11751 z m 6.7825321,8.93744 c 7.798782,3.34088 14.021085,4.57991 23.539648,10.21384 0.06323,0.09683 7.030824,3.46059 7.101892,11.9693 -1.747959,0.58819 -3.80969,1.05084 -7.660514,0.79788 -18.931394,-5.65863 -20.637086,-15.85766 -22.981026,-22.98102 z m 48.515902,6.70295 a 2.8726492,2.832751 0 0 0 -2.872693,2.83238 2.8726492,2.832751 0 0 0 2.872693,2.8329 2.8726492,2.832751 0 0 0 2.872693,-2.8329 2.8726492,2.832751 0 0 0 -2.872693,-2.83238 z" />
          </clipPath>
        </defs>

        <!-- ✅ wrap visible geometry in the same translate -->
        <g transform="translate(-8.8792699,-11.699063)">
          <path id="tm-path-stroke" class="tm-stroke"
            fill="none" stroke="${stroke}" stroke-width="1.8"
            stroke-linejoin="round" stroke-linecap="round"
            d="m 50.349392,11.831373 c -10.706181,0.01064 -20.268883,4.53423 -27.607617,13.06484 l 5.665287,2.79311 c 20.485986,-18.8695004 43.236536,-6.3299 49.633142,4.62814 l 6.78254,-0.31936 c -3.12332,-6.28395 -13.254868,-19.70478 -32.316894,-20.10833 -0.72359,-0.03956 -1.442713,-0.05911 -2.156458,-0.0584 z M 9.0170309,22.821403 c -0.400657,28.31751 21.2946271,35.79226 27.9285281,36.94555 -6.610619,5.38082 -8.316829,11.09056 -9.176701,17.07647 -5.78368,-6.09471 -8.201107,-13.48435 -8.458398,-21.70462 l -5.585706,-6.304 c -0.108855,8.63353 -0.08697,14.52749 2.25671,20.16156 18.803299,45.201987 82.40857,19.92794 72.91131,-25.82685 l -5.26686,2.07481 c 2.01344,6.35659 -0.81848,22.99654 -10.967289,32.12724 -11.883393,10.69129 -31.962697,12.77478 -38.426079,1.38699 -0.982085,-4.22289 1.290869,-8.41104 2.672189,-10.82879 3.279391,-5.74003 9.366187,-8.76553 13.047265,-10.07794 1.794304,-4.04299 1.616088,-8.08599 1.117245,-12.12898 4.029723,-12.89332 12.490205,-13.37342 18.592663,-4.78782 l 4.388363,-0.47852 c -5.044668,4.60933 -4.827386,2.37105 -7.281726,8.69352 -1.348775,3.47451 -1.511265,7.23458 -2.966744,10.53114 -3.138386,7.10825 -8.794416,12.6435 -20.711914,12.6137 0.9579,1.68284 1.301101,3.58908 4.468461,4.46846 10.684208,0.92596 21.444616,-10.43436 22.729362,-17.93482 1.695699,-9.89965 1.867653,-16.07654 26.903784,-21.48396 -8.03276,-1.96409 -16.06603,-1.22075 -24.098787,-1.67586 -1.500832,-1.3732 -7.805286,-7.70327 -15.057479,-5.66633 -5.010212,1.40725 -8.308832,4.02072 -11.115084,11.65097 -7.321841,-7.44236 -16.452753,-9.79742 -24.946798,-13.71441 -5.252336,-2.42207 -7.636009,-3.31735 -12.9563151,-5.11751 z m 6.7825321,8.93744 c 7.798782,3.34088 14.021085,4.57991 23.539648,10.21384 0.06323,0.09683 7.030824,3.46059 7.101892,11.9693 -1.747959,0.58819 -3.80969,1.05084 -7.660514,0.79788 -18.931394,-5.65863 -20.637086,-15.85766 -22.981026,-22.98102 z m 48.515902,6.70295 a 2.8726492,2.832751 0 0 0 -2.872693,2.83238 2.8726492,2.832751 0 0 0 2.872693,2.8329 2.8726492,2.832751 0 0 0 2.872693,-2.8329 2.8726492,2.832751 0 0 0 -2.872693,-2.83238 z" />

          <path class="tm-fill" fill="url(#tm-grad)"
            d="m 50.349392,11.831373 c -10.706181,0.01064 -20.268883,4.53423 -27.607617,13.06484 l 5.665287,2.79311 c 20.485986,-18.8695004 43.236536,-6.3299 49.633142,4.62814 l 6.78254,-0.31936 c -3.12332,-6.28395 -13.254868,-19.70478 -32.316894,-20.10833 -0.72359,-0.03956 -1.442713,-0.05911 -2.156458,-0.0584 z M 9.0170309,22.821403 c -0.400657,28.31751 21.2946271,35.79226 27.9285281,36.94555 -6.610619,5.38082 -8.316829,11.09056 -9.176701,17.07647 -5.78368,-6.09471 -8.201107,-13.48435 -8.458398,-21.70462 l -5.585706,-6.304 c -0.108855,8.63353 -0.08697,14.52749 2.25671,20.16156 18.803299,45.201987 82.40857,19.92794 72.91131,-25.82685 l -5.26686,2.07481 c 2.01344,6.35659 -0.81848,22.99654 -10.967289,32.12724 -11.883393,10.69129 -31.962697,12.77478 -38.426079,1.38699 -0.982085,-4.22289 1.290869,-8.41104 2.672189,-10.82879 3.279391,-5.74003 9.366187,-8.76553 13.047265,-10.07794 1.794304,-4.04299 1.616088,-8.08599 1.117245,-12.12898 4.029723,-12.89332 12.490205,-13.37342 18.592663,-4.78782 l 4.388363,-0.47852 c -5.044668,4.60933 -4.827386,2.37105 -7.281726,8.69352 -1.348775,3.47451 -1.511265,7.23458 -2.966744,10.53114 -3.138386,7.10825 -8.794416,12.6435 -20.711914,12.6137 0.9579,1.68284 1.301101,3.58908 4.468461,4.46846 10.684208,0.92596 21.444616,-10.43436 22.729362,-17.93482 1.695699,-9.89965 1.867653,-16.07654 26.903784,-21.48396 -8.03276,-1.96409 -16.06603,-1.22075 -24.098787,-1.67586 -1.500832,-1.3732 -7.805286,-7.70327 -15.057479,-5.66633 -5.010212,1.40725 -8.308832,4.02072 -11.115084,11.65097 -7.321841,-7.44236 -16.452753,-9.79742 -24.946798,-13.71441 -5.252336,-2.42207 -7.636009,-3.31735 -12.9563151,-5.11751 z m 6.7825321,8.93744 c 7.798782,3.34088 14.021085,4.57991 23.539648,10.21384 0.06323,0.09683 7.030824,3.46059 7.101892,11.9693 -1.747959,0.58819 -3.80969,1.05084 -7.660514,0.79788 -18.931394,-5.65863 -20.637086,-15.85766 -22.981026,-22.98102 z m 48.515902,6.70295 a 2.8726492,2.832751 0 0 0 -2.872693,2.83238 2.8726492,2.832751 0 0 0 2.872693,2.8329 2.8726492,2.832751 0 0 0 2.872693,-2.8329 2.8726492,2.832751 0 0 0 -2.872693,-2.83238 z" />
        </g>

        <g clip-path="url(#tm-clip)" class="tm-shimmer" ${shimmer ? "" : "style=\"display:none\""}>
          <rect width="120%" height="120%" x="-10%" y="-10%" fill="white" opacity="0.0" />
          <g class="tm-sheen">
            <rect x="-40%" y="-20%" width="40%" height="140%" fill="white" opacity="0.15" />
          </g>
        </g>
      </svg>
    </div>`;

    const path = this.shadowRoot.getElementById("tm-path-stroke");
    try {
      const len = path.getTotalLength();
      path.style.setProperty("--path-length", String(len));
    } catch {}

    if (this._prefersReduced) this.classList.add("reduced");

    if (this.hasAttribute("play-on-visible")) {
      this.pause();
      this._io = new IntersectionObserver((entries)=>{
        entries.forEach(e=> e.isIntersecting ? this.play() : this.pause());
      },{threshold:0.35});
      this._io.observe(this);
    }
  }

  disconnectedCallback(){ if (this._io) this._io.disconnect(); }

  attributeChangedCallback(name, oldV, newV){
    if (!this.shadowRoot) return;
    if (name === "accent") {
      const stops = this.shadowRoot.querySelectorAll("#tm-grad stop");
      if (stops[0]) stops[0].setAttribute("stop-color", newV || "#00E5A8");
      if (stops[2]) stops[2].setAttribute("stop-color", newV || "#00E5A8");
    }
    if (name === "secondary") {
      const stops = this.shadowRoot.querySelectorAll("#tm-grad stop");
      if (stops[1]) stops[1].setAttribute("stop-color", newV || "#7DF3FF");
    }
    if (name === "stroke") {
      const p = this.shadowRoot.getElementById("tm-path-stroke");
      if (p) p.setAttribute("stroke", newV || "#0f172a");
    }
    if (name === "shimmer") {
      const g = this.shadowRoot.querySelector(".tm-shimmer");
      if (g) g.style.display = (this.getAttribute("shimmer") === "false") ? "none" : "";
    }
  }

  play(){ this.classList.remove("paused"); }
  pause(){ this.classList.add("paused"); }
  restart(){
    const svg = this.shadowRoot.querySelector(".tm-logo");
    if (!svg) return;
    const clone = svg.cloneNode(true);
    svg.replaceWith(clone);
    if (this.classList.contains("paused")) this.pause();
  }
}
customElements.define('tm-animated-logo', TMAnimatedLogo);
