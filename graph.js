function getRadius(node) {
  if (node.id === 'ai-readiness' || node.id === 'berners-lee') return 26;
  if (node.id === 'www' || node.id === 'semantic-web' || node.id === 'knowledge-graph' || node.id === 'llm') return 22;
  if (node.id === 'wikidata' || node.id === 'json-ld' || node.id === 'schema-org' || node.id === 'surveillance-cap') return 18;
  return 15;
}

window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    const container = document.querySelector('.canvas-wrapper');
    if (!container) return;
  
  const svgEl = document.getElementById('d3-graph');
  if (!svgEl) return;
  
  const dataSrc = svgEl.getAttribute('data-src');
  if (!dataSrc) return;

  const langYear = svgEl.getAttribute('data-lang-year') || 'Anno';
  const langType = svgEl.getAttribute('data-lang-type') || 'Tipo';
  const langDefined = svgEl.getAttribute('data-lang-defined') || 'Definito nel';
  const langThisNode = svgEl.getAttribute('data-lang-this-node') || 'questo nodo';

  let width = container.clientWidth || 600;
  let height = container.clientHeight || 520;

  const svg = d3.select('#d3-graph');
  const g = svg.append('g').attr('class', 'graph-g');

  const zoom = d3.zoom()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    svg.transition().duration(300).call(zoom.scaleBy, 1.3);
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    svg.transition().duration(300).call(zoom.scaleBy, 1/1.3);
  });
  document.getElementById('btn-reset-layout').addEventListener('click', () => {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    d3.selectAll('.node circle').classed('highlighted', false);
    d3.selectAll('.link').classed('highlighted', false);
    document.getElementById('details-content').classList.add('hidden');
    document.getElementById('details-default').classList.remove('hidden');
  });

  const defs = svg.append('defs');

  defs.append('marker')
    .attr('id', 'arrow-default')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 9)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'var(--text-muted)')
    .attr('opacity', 0.45);

  defs.append('marker')
    .attr('id', 'arrow-active')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 9)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'var(--accent)')
    .attr('opacity', 0.95);

  d3.json(dataSrc).then(data => {
    const graphNodes = data.nodes;
    const graphLinks = data.links;

    const simulation = d3.forceSimulation(graphNodes)
      .force('link', d3.forceLink(graphLinks).id(d => d.id).distance(135))
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => getRadius(d) + 18));

    const linkGroup = g.append('g').attr('class', 'links-g');
    const linkWrapper = linkGroup.selectAll('.link-container')
      .data(graphLinks)
      .enter()
      .append('g')
      .attr('class', 'link-container');

    const link = linkWrapper.append('path')
      .attr('class', 'link')
      .attr('marker-end', 'url(#arrow-default)');

    const linkLabel = linkWrapper.append('text')
      .attr('class', 'link-label')
      .text(d => d.rel);

    const nodeGroup = g.append('g').attr('class', 'nodes-g');
    const node = nodeGroup.selectAll('.node')
      .data(graphNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .clickDistance(10)
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('circle')
      .attr('r', d => getRadius(d))
      .attr('class', d => `node-${d.type}`);

    node.append('text')
      .attr('y', d => getRadius(d) + 12)
      .text(d => d.label)
      .style('font-family', "'IBM Plex Mono', monospace")
      .style('font-weight', '600')
      .style('font-size', '0.65rem');

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    const tooltip = d3.select('#tooltip');

    node.on('mouseover', function(event, d) {
      tooltip.style('opacity', 1)
        .html(`${langYear}: ${d.year}<br>${langType}: ${d.type.toUpperCase()}`);

      link.classed('highlighted', l => l.source.id === d.id || l.target.id === d.id);
      link.attr('marker-end', l => (l.source.id === d.id || l.target.id === d.id) ? 'url(#arrow-active)' : 'url(#arrow-default)');
    });

    node.on('mousemove', function(event) {
      tooltip.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 15) + 'px');
    });

    node.on('mouseout', function() {
      tooltip.style('opacity', 0);
      link.classed('highlighted', false);
      link.attr('marker-end', 'url(#arrow-default)');
    });

    node.on('click', function(event, d) {
      event.stopPropagation();
      d3.selectAll('.node circle').classed('highlighted', false);
      d3.select(this).select('circle').classed('highlighted', true);

      link.classed('highlighted', l => l.source.id === d.id || l.target.id === d.id);
      link.attr('marker-end', l => (l.source.id === d.id || l.target.id === d.id) ? 'url(#arrow-active)' : 'url(#arrow-default)');
      showNodeDetails(d);
    });

    svg.on('click', function() {
      d3.selectAll('.node circle').classed('highlighted', false);
      link.classed('highlighted', false);
      link.attr('marker-end', 'url(#arrow-default)');
      document.getElementById('details-content').classList.add('hidden');
      document.getElementById('details-default').classList.remove('hidden');
    });

    function showNodeDetails(d) {
      document.getElementById('details-default').classList.add('hidden');
      document.getElementById('details-content').classList.remove('hidden');

      document.getElementById('node-name').innerText = d.label;
      document.getElementById('node-year').innerText = `${langDefined} ${d.year}`;
      document.getElementById('node-description').innerText = d.desc;

      const badge = document.getElementById('node-type-badge');
      badge.innerText = d.type;

      badge.className = 'node-badge';
      let themeColor = 'var(--accent)';
      if (d.type === 'person') themeColor = 'var(--color-person)';
      else if (d.type === 'concept') themeColor = 'var(--color-topic)';
      else if (d.type === 'standard') themeColor = 'var(--color-org)';
      else if (d.type === 'tool') themeColor = 'var(--color-credential)';
      else if (d.type === 'critique') themeColor = 'var(--color-occupation)';

      badge.style.color = themeColor;
      badge.style.borderColor = themeColor;
      badge.style.backgroundColor = themeColor + '15';

      const wLink = document.getElementById('node-wikidata-link');
      const wContainer = wLink.parentElement;
      if (d.wikidata) {
        wContainer.style.display = 'block';
        wLink.href = `https://www.wikidata.org/wiki/${d.wikidata}`;
        document.getElementById('node-wikidata-text').innerText = `wikidata.org/wiki/${d.wikidata} ↗`;
      } else {
        wContainer.style.display = 'none';
      }

      const rels = graphLinks.filter(l => l.source.id === d.id || l.target.id === d.id);
      const list = document.getElementById('node-relations-list');
      list.innerHTML = rels.map(l => {
        if (l.source.id === d.id) {
          return `<li style="margin-bottom: 0.35rem;">${langThisNode} <span style="color: var(--accent);">&rarr; ${l.rel} &rarr;</span> <strong>${l.target.label}</strong></li>`;
        } else {
          return `<li style="margin-bottom: 0.35rem;"><strong>${l.source.label}</strong> <span style="color: var(--accent);">&rarr; ${l.rel} &rarr;</span> ${langThisNode}</li>`;
        }
      }).join('');
    }

    simulation.on('tick', () => {
      link.attr('d', d => {
        if (!d.source.x || !d.target.x) return 'M0,0L0,0';
        const rTarget = getRadius(d.target) + 2.5;
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0 || isNaN(dist)) return 'M0,0L0,0';
        const offsetX = (dx / dist) * rTarget;
        const offsetY = (dy / dist) * rTarget;
        return `M${d.source.x},${d.source.y}L${d.target.x - offsetX},${d.target.y - offsetY}`;
      });

      linkLabel.attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2 - 5);

      node.attr('transform', d => {
        const r = getRadius(d);
        d.x = Math.max(r, Math.min(width - r, d.x));
        d.y = Math.max(r, Math.min(height - r, d.y));
        return `translate(${d.x},${d.y})`;
      });
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filterType = this.getAttribute('data-filter');

        if (filterType === 'all') {
          node.style('opacity', 1).style('pointer-events', 'auto');
          link.style('opacity', 0.45);
        } else {
          node.style('opacity', d => d.type === filterType ? 1 : 0.15)
              .style('pointer-events', d => d.type === filterType ? 'auto' : 'none');
          link.style('opacity', l => (l.source.type === filterType && l.target.type === filterType) ? 0.45 : 0.05);
        }
      });
    });

    document.getElementById('node-search').addEventListener('input', function() {
      const q = this.value.toLowerCase().trim();
      if (!q) {
        node.style('opacity', 1).style('pointer-events', 'auto');
        link.style('opacity', 0.45);
        d3.selectAll('.node circle').classed('highlighted', false);
      } else {
        node.style('opacity', d => d.label.toLowerCase().includes(q) ? 1 : 0.15)
            .style('pointer-events', d => d.label.toLowerCase().includes(q) ? 'auto' : 'none');
        link.style('opacity', l => (l.source.label.toLowerCase().includes(q) || l.target.label.toLowerCase().includes(q)) ? 0.45 : 0.05);

        node.each(function(d) {
          d3.select(this).select('circle').classed('highlighted', d.label.toLowerCase().includes(q));
        });
      }
    });

    window.addEventListener('resize', () => {
      width = container.clientWidth;
      height = container.clientHeight || 520;
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
      simulation.alpha(0.3).restart();
    });
  }).catch(err => {
    console.error("Error loading graph data:", err);
  });
});
});
