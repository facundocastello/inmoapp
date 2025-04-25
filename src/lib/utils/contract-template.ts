import { AVAILABLE_VARIABLES } from '@/components/admin/contract/ContractTemplateEditor'
import { ContractWithRelations } from '@/lib/actions/tenant/contract'

export function replaceTemplateVariables(
  template: string,
  contract: ContractWithRelations,
): string {
  let result = template

  // Replace all variables in the template
  Object.values(AVAILABLE_VARIABLES).forEach((category) => {
    category.forEach((variable) => {
      const value = variable.render(contract)
      result = result.replaceAll(variable.value, value)
    })
  })

  return result
}
