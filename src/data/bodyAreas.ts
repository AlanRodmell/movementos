import type { MuscleArea } from '../domain/types'

export type BodyAreaGroup={id:'upper'|'trunk'|'lower';label:string;icon:string;areas:Array<[MuscleArea,string]>}

export const BODY_AREA_GROUPS:BodyAreaGroup[]=[
  {id:'upper',label:'Upper body',icon:'↑',areas:[['neck','Neck'],['shoulders','Shoulders'],['chest','Chest'],['upper_back','Upper back'],['mid_back','Mid back'],['biceps','Upper arms'],['elbows','Elbows'],['forearms','Forearms'],['wrists','Wrists'],['hands','Hands']]},
  {id:'trunk',label:'Trunk & hips',icon:'◆',areas:[['core','Abdomen / core'],['lower_back','Lower back'],['hips','Hips'],['hip_flexors','Hip flexors'],['adductors','Groin / inner thigh'],['glutes','Glutes']]},
  {id:'lower',label:'Lower body',icon:'↓',areas:[['quads','Front thigh'],['hamstrings','Back thigh'],['knees','Knees'],['calves','Calves'],['shins','Shins'],['ankles','Ankles'],['feet','Feet']]},
]

export const selectableBodyAreas=BODY_AREA_GROUPS.flatMap(group=>group.areas.map(([id])=>id))
const labels=new Map(BODY_AREA_GROUPS.flatMap(group=>group.areas))
export const bodyAreaLabel=(area:MuscleArea)=>labels.get(area)??area.replaceAll('_',' ')
