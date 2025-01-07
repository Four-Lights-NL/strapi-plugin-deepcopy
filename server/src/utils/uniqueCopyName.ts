const uniqueCopyName = (name: string) => {
  // FIXME: Just use randomUUID or something
  const maxValue = 0xffffff
  const minValue = 0x100000
  return `${name} (${(minValue + Math.floor(Math.random() * (maxValue - minValue))).toString(16)})`
}

export default uniqueCopyName
