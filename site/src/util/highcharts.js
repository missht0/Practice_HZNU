export const caluColor = (list) => {
  let min =0
  let max =0 
  let ret = []
  list.map(o=>{
    if (o.cal>max) max = o.cal
    if (o.cal<min) min = o.cal
  })
  list.map(o=>{
    let c = parseInt((1-(o.cal - min)/(max-min))*220)
    ret.push(`rgb(220,${c},${c})`)
  })
  return ret
}

export const exporting = { 
  buttons: {
    contextButton: {
      menuItems: ["printChart", "separator", "downloadPNG", "downloadPDF","downloadSVG", "separator","downloadCSV","downloadXLS"]
    }
  }
}


export const lang = {
    viewFullscreen:"全屏",
    contextButtonTitle:"图表导出菜单",
    downloadJPEG:"下载JPEG图片",
    downloadPDF:"下载PDF文件",
    downloadPNG:"下载PNG文件",
    downloadSVG:"下载SVG文件",
    downloadCSV:"下载CSV文件",
    downloadCSV:"下载CSV文件",
    downloadXLS:"下载XLS文件",
    drillUpText:"返回{series.name}",
    loading:"加载中",
    noData:"没有数据",
    printChart:"打印图表",
    resetZoom:"恢复缩放",
    resetZoomTitle:"恢复图表",
}

