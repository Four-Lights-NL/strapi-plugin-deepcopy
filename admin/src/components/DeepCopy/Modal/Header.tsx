import { Flex, Modal } from "@strapi/design-system"

import { useDeepCopy } from "../../../hooks/useDeepCopy"

const DeepCopyModalHeader = () => {
  const { label } = useDeepCopy()
  return (
    <Modal.Header>
      <Flex alignItems="center" justifyContent="center" gap={3}>
        {label}
      </Flex>
    </Modal.Header>
  )
}

export { DeepCopyModalHeader }
