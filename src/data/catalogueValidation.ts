import type { Exercise } from '../domain/types'

export interface CatalogueIssue {
  exerciseId: string
  field: keyof Exercise | 'id'
  message: string
}

export function validateExerciseCatalogue(catalogue:Exercise[]):CatalogueIssue[] {
  const issues:CatalogueIssue[]=[]
  const ids=new Set<string>()
  const report=(exercise:Exercise,field:CatalogueIssue['field'],message:string)=>issues.push({exerciseId:exercise.id||'(missing)',field,message})

  catalogue.forEach(exercise=>{
    if(!/^[\w-]{1,100}$/.test(exercise.id))report(exercise,'id','Use a stable, storage-safe identifier.')
    if(ids.has(exercise.id))report(exercise,'id','Identifier is duplicated.')
    ids.add(exercise.id)
    if(!exercise.name.trim())report(exercise,'name','Name is required.')
    if(!exercise.description.trim())report(exercise,'description','Coaching guidance is required.')
    if(!exercise.prescription.trim())report(exercise,'prescription','A rep or time prescription is required.')
    if(!Number.isFinite(exercise.durationSeconds)||exercise.durationSeconds<1||exercise.durationSeconds>3600)report(exercise,'durationSeconds','Duration must be between 1 and 3600 seconds.')
    if(exercise.level<0||exercise.level>5)report(exercise,'level','Level must be between 0 and 5.')
    if(!exercise.equipment.length)report(exercise,'equipment','At least one equipment option is required.')
    if(!exercise.primaryMuscles.length)report(exercise,'primaryMuscles','At least one primary area is required for focus and load calculations.')
    if(!exercise.goals.length)report(exercise,'goals','At least one compatible goal is required.')
    if(!exercise.contraindications.length)report(exercise,'contraindications','At least one review area is required for issue-based safety rules.')
    if(exercise.videoUrl&&!/^https?:\/\//i.test(exercise.videoUrl))report(exercise,'videoUrl','Video links must use HTTP or HTTPS.')
  })
  return issues
}
