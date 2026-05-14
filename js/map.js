const MapModule = (() => {
  let _svg, _g, _pathGen, _features = [], _config;
  let _zoom, _width, _height;

  const PADDING = 14;

  function _proj(type) {
    return type === 'naturalEarth' ? d3.geoNaturalEarth1() : d3.geoMercator();
  }

  function _computeTransform(thing, fill, maxScale) {
    try {
      const b = _pathGen.bounds(thing);
      const dx = b[1][0] - b[0][0];
      const dy = b[1][1] - b[0][1];
      if (!isFinite(dx) || !isFinite(dy) || dx <= 0 || dy <= 0) return null;
      const cx = (b[0][0] + b[1][0]) / 2;
      const cy = (b[0][1] + b[1][1]) / 2;
      const scale = Math.min(maxScale, fill / Math.max(dx / _width, dy / _height));
      return d3.zoomIdentity.translate(_width / 2 - scale * cx, _height / 2 - scale * cy).scale(scale);
    } catch (e) {
      return null;
    }
  }

  function init(svgEl, width, height, config, features) {
    _svg = d3.select(svgEl);
    _width = width;
    _height = height;
    _config = config;
    _features = features;

    const projection = _proj(config.projection).fitExtent(
      [[PADDING, PADDING], [width - PADDING, height - PADDING]],
      { type: 'FeatureCollection', features }
    );
    _pathGen = d3.geoPath(projection);

    _svg.selectAll('*').remove();
    _g = _svg.append('g');

    _g.selectAll('.county-path')
      .data(features, d => config.getId(d))
      .enter().append('path')
      .attr('class', 'county-path')
      .attr('d', d => _pathGen(d))
      .attr('fill', 'var(--county-default)')
      .attr('stroke', 'var(--county-default-stroke)')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round');

    _zoom = d3.zoom()
      .scaleExtent([0.8, config.maxScale * 1.5])
      .on('zoom', evt => {
        const t = evt.transform;
        _g.attr('transform', t);
        _g.selectAll('.county-path').attr('stroke-width', 1 / t.k);
        const ind = svgEl.parentElement && svgEl.parentElement.querySelector('.scale-indicator');
        if (ind) ind.textContent = t.k.toFixed(1) + '×';
      });

    _svg.call(_zoom);
  }

  function resetStyles() {
    if (!_g) return;
    _g.selectAll('.county-path')
      .attr('fill', 'var(--county-default)')
      .attr('stroke', 'var(--county-default-stroke)');
  }

  function highlight(feature) {
    if (!_g || !feature) return;
    const tid = _config.getId(feature);
    _g.selectAll('.county-path').each(function (d) {
      const el = d3.select(this);
      const isTarget = _config.getId(d) === tid;
      el.attr('fill', isTarget ? 'var(--county-highlight)' : 'var(--county-dim)')
        .attr('stroke', isTarget ? 'var(--county-highlight-stroke)' : 'var(--county-dim-stroke)');
    });
  }

  function markCorrect(feature) {
    if (!_g || !feature) return;
    const tid = _config.getId(feature);
    _g.selectAll('.county-path')
      .filter(d => _config.getId(d) === tid)
      .attr('fill', 'var(--county-correct)')
      .attr('stroke', 'var(--county-highlight-stroke)');
  }

  function markWrong(feature) {
    if (!_g || !feature) return;
    const wid = _config.getId(feature);
    _g.selectAll('.county-path')
      .filter(d => _config.getId(d) === wid)
      .attr('fill', 'var(--county-wrong)')
      .attr('stroke', '#b03030');
  }

  function zoomTo(feature, duration) {
    if (!_svg || !feature) return;
    duration = duration !== undefined ? duration : 600;
    const t = _computeTransform(feature, _config.fillRatio, _config.maxScale);
    if (!t) { resetZoom(duration); return; }
    _svg.transition().duration(duration).ease(d3.easeCubicInOut)
      .call(_zoom.transform, t);
  }

  function zoomToFit(featureArr, duration) {
    if (!_svg) return;
    duration = duration !== undefined ? duration : 600;
    const valid = featureArr.filter(Boolean);
    if (!valid.length) return;
    const fc = { type: 'FeatureCollection', features: valid };
    const t = _computeTransform(fc, 0.55, _config.maxScale);
    if (!t) return;
    _svg.transition().duration(duration).ease(d3.easeCubicInOut)
      .call(_zoom.transform, t);
  }

  function resetZoom(duration) {
    if (!_svg) return;
    duration = duration !== undefined ? duration : 400;
    _svg.transition().duration(duration).ease(d3.easeCubicInOut)
      .call(_zoom.transform, d3.zoomIdentity);
  }

  return { init, resetStyles, highlight, markCorrect, markWrong, zoomTo, zoomToFit, resetZoom };
})();
