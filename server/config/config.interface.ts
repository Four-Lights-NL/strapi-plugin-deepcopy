export default interface DeepCopyConfig {
  excludeFromCopy: string[]
  contentTypes: Record<string, boolean>
}
