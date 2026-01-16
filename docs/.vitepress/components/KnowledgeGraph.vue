<template>
  <div ref="graphContainer" class="knowledge-graph"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'
import articlesData from '../graph-data.json'

const graphContainer = ref(null)
const expandedNodes = ref(new Set())

const baseData = {
  nodes: [
    { id: 'DevOps', group: 0, size: 30, isRoot: true },
    { id: 'Docker', group: 1, size: 20, count: 43 },
    { id: 'Jenkins', group: 2, size: 20, count: 48 },
    { id: 'K8s', group: 3, size: 20, count: 45 },
    { id: 'Prometheus', group: 4, size: 18, count: 29 },
    { id: 'Linux', group: 5, size: 16, count: 20 },
    { id: 'GithubActions', group: 6, size: 14, count: 14 },
    { id: 'Ansible2', group: 7, size: 12, count: 11 },
    { id: 'Terraform', group: 8, size: 10, count: 4 }
  ],
  links: [
    { source: 'DevOps', target: 'Docker' },
    { source: 'DevOps', target: 'Jenkins' },
    { source: 'DevOps', target: 'K8s' },
    { source: 'DevOps', target: 'Prometheus' },
    { source: 'DevOps', target: 'Linux' },
    { source: 'DevOps', target: 'GithubActions' },
    { source: 'DevOps', target: 'Ansible2' },
    { source: 'DevOps', target: 'Terraform' },
    { source: 'Docker', target: 'K8s' },
    { source: 'Jenkins', target: 'K8s' },
    { source: 'K8s', target: 'Prometheus' }
  ]
}

onMounted(() => {
  const width = 800
  const height = 600
  let currentData = { nodes: [...baseData.nodes], links: [...baseData.links] }

  const svg = d3.select(graphContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  const linkGroup = svg.append('g')
  const nodeGroup = svg.append('g')

  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2))

  function update() {
    const link = linkGroup.selectAll('line').data(currentData.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`)
    link.exit().remove()
    link.enter().append('line').attr('stroke', '#999').attr('stroke-width', 2).merge(link)

    const node = nodeGroup.selectAll('g').data(currentData.nodes, d => d.id)
    node.exit().remove()
    const nodeEnter = node.enter().append('g')
      .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))
      .on('click', (event, d) => {
        if (d.isRoot) return
        if (expandedNodes.value.has(d.id)) {
          collapse(d.id)
        } else {
          expand(d.id)
        }
      })

    nodeEnter.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.isArticle ? '#95de64' : d3.schemeCategory10[d.group])
      .style('cursor', d => d.isRoot ? 'default' : 'pointer')

    nodeEnter.append('text')
      .attr('x', 0)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#333')

    nodeGroup.selectAll('text').text(d => {
      if (d.isArticle) return d.id.replace('.md', '').slice(0, 20)
      return `${d.id}${d.count ? ` (${d.count})` : ''}`
    })

    simulation.nodes(currentData.nodes)
    simulation.force('link').links(currentData.links)
    simulation.alpha(0.3).restart()
  }

  function expand(nodeId) {
    expandedNodes.value.add(nodeId)
    const articles = articlesData[nodeId] || []
    const parentNode = currentData.nodes.find(n => n.id === nodeId)
    
    articles.forEach((article, i) => {
      const articleId = `${nodeId}-${article}`
      if (!currentData.nodes.find(n => n.id === articleId)) {
        currentData.nodes.push({
          id: article,
          group: parentNode.group,
          size: 8,
          isArticle: true,
          parent: nodeId
        })
        currentData.links.push({ source: nodeId, target: article })
      }
    })
    update()
  }

  function collapse(nodeId) {
    expandedNodes.value.delete(nodeId)
    currentData.nodes = currentData.nodes.filter(n => n.parent !== nodeId)
    currentData.links = currentData.links.filter(l => 
      (l.source.id || l.source) !== nodeId || 
      !currentData.nodes.every(n => n.id !== (l.target.id || l.target) || n.parent !== nodeId)
    )
    update()
  }

  simulation.on('tick', () => {
    linkGroup.selectAll('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    nodeGroup.selectAll('g').attr('transform', d => `translate(${d.x},${d.y})`)
  })

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }

  update()
})
</script>

<style scoped>
.knowledge-graph {
  width: 100%;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}
</style>
