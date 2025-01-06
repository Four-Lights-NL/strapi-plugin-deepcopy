import { useEffect, useRef } from "react"

import plugin from "../plugin"

type InitializerProps = {
  setPlugin: (id: string) => void
}
const Initializer = ({ setPlugin }: InitializerProps) => {
  const ref = useRef(setPlugin)

  useEffect(() => {
    ref.current(plugin.id)
  }, [])

  return null
}

export { Initializer }
