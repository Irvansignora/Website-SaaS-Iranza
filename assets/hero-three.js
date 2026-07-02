/* =========================================================================
   HERO THREE.JS BACKGROUND — a slow-drifting 3D node network rendered with
   WebGL, layered behind every hero (.hero-band on Home, .page-hero on the
   inner pages). Nodes float in 3D space, nearby nodes connect with a thin
   line, the whole field rotates gently and drifts toward the cursor for a
   subtle parallax feel. Pauses off-screen via IntersectionObserver and
   respects prefers-reduced-motion (draws a single static frame instead).
   ========================================================================= */
(function(){
  function initHeroThree(section){
    if(typeof THREE === 'undefined') return;
    const canvas = section.querySelector('.hero-three-canvas');
    if(!canvas) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.innerWidth < 640;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.z = 62;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    function resize(){
      const w = section.clientWidth || 1;
      const h = section.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    const NODE_COUNT = isSmall ? 46 : 110;
    const SPREAD_X = isSmall ? 60 : 95;
    const SPREAD_Y = isSmall ? 42 : 58;
    const SPREAD_Z = 50;
    const LINK_DIST = isSmall ? 20 : 24;

    const nodes = [];
    const positions = new Float32Array(NODE_COUNT * 3);
    for(let i = 0; i < NODE_COUNT; i++){
      const n = {
        x: (Math.random() - 0.5) * SPREAD_X * 2,
        y: (Math.random() - 0.5) * SPREAD_Y * 2,
        z: (Math.random() - 0.5) * SPREAD_Z * 2,
        vx: (Math.random() - 0.5) * 0.026,
        vy: (Math.random() - 0.5) * 0.026,
        vz: (Math.random() - 0.5) * 0.026
      };
      nodes.push(n);
      positions[i*3] = n.x; positions[i*3+1] = n.y; positions[i*3+2] = n.z;
    }

    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointMat = new THREE.PointsMaterial({
      color: 0x2997ff, size: isSmall ? 1.6 : 1.9,
      transparent: true, opacity: 0.9, sizeAttenuation: true
    });
    const points = new THREE.Points(pointGeo, pointMat);
    scene.add(points);

    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0066cc, transparent: true, opacity: 0.16 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    const group = new THREE.Group();
    group.add(points);
    group.add(lines);
    scene.add(group);

    function rebuildLines(){
      const linePositions = [];
      for(let i = 0; i < nodes.length; i++){
        for(let j = i + 1; j < nodes.length; j++){
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if(dist < LINK_DIST){
            linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
          }
        }
      }
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    }
    rebuildLines();

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function(e){
      const rect = section.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) - 0.5;
      mouseY = ((e.clientY - rect.top) / rect.height) - 0.5;
    });

    let frame = 0, running = false, rafId = null;
    function tick(){
      if(!running) return;
      frame++;
      for(let i = 0; i < nodes.length; i++){
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy; n.z += n.vz;
        if(Math.abs(n.x) > SPREAD_X) n.vx *= -1;
        if(Math.abs(n.y) > SPREAD_Y) n.vy *= -1;
        if(Math.abs(n.z) > SPREAD_Z) n.vz *= -1;
        positions[i*3] = n.x; positions[i*3+1] = n.y; positions[i*3+2] = n.z;
      }
      pointGeo.attributes.position.needsUpdate = true;
      if(frame % 5 === 0) rebuildLines();

      group.rotation.y += 0.0012;
      group.rotation.x += 0.0003;
      camera.position.x += (mouseX * 10 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 10 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }
    function start(){ if(running || reduceMotion) return; running = true; tick(); }
    function stop(){ running = false; if(rafId) cancelAnimationFrame(rafId); }

    resize();
    window.addEventListener('resize', resize);

    if(reduceMotion){
      renderer.render(scene, camera);
      return;
    }

    const io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.isIntersecting ? start() : stop(); });
    }, { threshold: 0 });
    io.observe(section);
  }

  document.querySelectorAll('[data-hero-three]').forEach(initHeroThree);
})();
