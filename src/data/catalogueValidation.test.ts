import { exercises } from './exercises'
import { validateExerciseCatalogue } from './catalogueValidation'

it('keeps every built-in movement structurally usable by safety and generation rules',()=>{
  expect(validateExerciseCatalogue(exercises)).toEqual([])
})

it('reports duplicate and incomplete exercise metadata',()=>{
  const broken={...exercises[0],id:'duplicate',description:'',contraindications:[]}
  const issues=validateExerciseCatalogue([broken,{...broken,description:'Present'}])
  expect(issues).toEqual(expect.arrayContaining([
    expect.objectContaining({field:'description'}),
    expect.objectContaining({field:'contraindications'}),
    expect.objectContaining({field:'id',message:'Identifier is duplicated.'}),
  ]))
})
