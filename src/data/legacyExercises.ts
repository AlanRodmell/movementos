import type { Exercise } from '../domain/types'

export const legacyExercises: Exercise[] = [
  {
    "id": "w1",
    "name": "Jumping Jacks",
    "description": "Jump feet out wide while raising arms overhead.",
    "category": "warmup",
    "pattern": "cardio",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "30 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "w2",
    "name": "High Knees",
    "description": "Jog in place, driving knees up.",
    "category": "warmup",
    "pattern": "cardio",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [
      "legs",
      "hip_flexors"
    ],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "w3",
    "name": "Toe Touch Rotations",
    "description": "Hinge forward, touch internal toes, rotate up.",
    "category": "warmup",
    "pattern": "dynamic",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "w4",
    "name": "Standing Torso Rotations",
    "description": "Stand and rotate torso side to side.",
    "category": "warmup",
    "pattern": "dynamic",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [
      "obliques"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "w5",
    "name": "Arm Circles & Leg Swings",
    "description": "Circle arms, swing legs.",
    "category": "warmup",
    "pattern": "dynamic",
    "level": 0,
    "durationSeconds": 40,
    "prescription": "10 each",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [
      "shoulders",
      "legs"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "w6",
    "name": "Hip Circles & Ankle Rolls",
    "description": "Circle hips, roll ankles.",
    "category": "warmup",
    "pattern": "dynamic",
    "level": 0,
    "durationSeconds": 40,
    "prescription": "10 each",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [
      "hips",
      "calves"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "w7",
    "name": "World's Greatest Stretch",
    "description": "Step forward into a deep lunge. Place opposite hand on the floor, drop your elbow inside the front foot, then rotate your torso and reach that arm toward the ceiling.",
    "category": "warmup",
    "pattern": "dynamic",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "5 per side",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [
      "hip_flexors",
      "hamstrings",
      "upper_back"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "w8",
    "name": "Bear Crawl",
    "description": "Crawl forward/back on all fours.",
    "category": "warmup",
    "pattern": "locomotion",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "8-10 steps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [
      "shoulders",
      "core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c1",
    "name": "Jump Rope",
    "description": "Skip rope or mimic motion.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 1,
    "durationSeconds": 60,
    "prescription": "60 sec",
    "equipment": [
      "rope"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c2",
    "name": "Squat to Reach",
    "description": "Squat down, drive up and reach.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 1,
    "durationSeconds": 35,
    "prescription": "12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c3",
    "name": "Plank Walkouts",
    "description": "Hinge and walk hands to plank.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "6-8 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c4",
    "name": "Burpees",
    "description": "Drop to push-up, jump feet in, leap up.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 2,
    "durationSeconds": 60,
    "prescription": "60 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c5",
    "name": "Mountain Climbers",
    "description": "High plank, drive knees to chest quickly.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 1,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c6",
    "name": "Skater Jumps",
    "description": "Leap laterally from one foot to the other.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c7",
    "name": "Crab Walks",
    "description": "Crawl forward/backward with chest facing up.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 1,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c8",
    "name": "Inchworms",
    "description": "Walk hands out to plank, walk feet to hands.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 1,
    "durationSeconds": 60,
    "prescription": "60 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c9",
    "name": "Burpee Broad Jumps",
    "description": "Do a burpee, but jump far forward instead of straight up.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 3,
    "durationSeconds": 50,
    "prescription": "10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "c10",
    "name": "High Knee Sprawls",
    "description": "High knees for 4 counts, then drop into a push-up position sprawl.",
    "category": "conditioning",
    "pattern": "cardio",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "endurance",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "u21",
    "name": "Wall Push-Ups",
    "description": "Stand facing wall, press away.",
    "category": "upper",
    "pattern": "pushup",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "12-15 reps",
    "equipment": [
      "wall"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u22",
    "name": "Knee Push-Ups",
    "description": "Standard push-up with knees on floor.",
    "category": "upper",
    "pattern": "pushup",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "10-15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u2",
    "name": "Incline Push-Ups",
    "description": "Hands on a bench/step to reduce load.",
    "category": "upper",
    "pattern": "pushup",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "10-12 reps",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u1",
    "name": "Push-Ups",
    "description": "Standard push-up on the floor.",
    "category": "upper",
    "pattern": "pushup",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "10-15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u4",
    "name": "Diamond Push-Ups",
    "description": "Thumbs and index fingers forming a diamond.",
    "category": "upper",
    "pattern": "pushup",
    "level": 2,
    "durationSeconds": 35,
    "prescription": "8-10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u29",
    "name": "Hindu Push-Ups",
    "description": "Swoop chest down and up into upward dog, then push hips back.",
    "category": "upper",
    "pattern": "pushup",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "8-12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u23",
    "name": "Typewriter Push-Ups",
    "description": "Lower to one side, slide across to other.",
    "category": "upper",
    "pattern": "pushup",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "6-8 reps",
    "equipment": [
      "slider"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u24",
    "name": "Pseudo-Planche Push-Ups",
    "description": "Hands further back towards waist, lean forward.",
    "category": "upper",
    "pattern": "pushup",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "6-8 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u18",
    "name": "Archer Push-Ups",
    "description": "Wide stance, lower chest to one hand.",
    "category": "upper",
    "pattern": "pushup",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "6-8 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u20",
    "name": "Explosive Push-Ups",
    "description": "Push up forcefully enough for hands to leave ground.",
    "category": "upper",
    "pattern": "pushup",
    "level": 3,
    "durationSeconds": 35,
    "prescription": "8-10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u30",
    "name": "Decline Diamond Push-Ups",
    "description": "Feet elevated, hands forming a diamond. Heavy triceps focus.",
    "category": "upper",
    "pattern": "pushup",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "8-10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u10",
    "name": "Doorframe Rows",
    "description": "Grip doorframe, lean back, pull chest to hands.",
    "category": "upper",
    "pattern": "row",
    "level": 1,
    "durationSeconds": 35,
    "prescription": "8-10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u11",
    "name": "Table-Top Rows",
    "description": "Lie under table, pull chest up.",
    "category": "upper",
    "pattern": "row",
    "level": 2,
    "durationSeconds": 35,
    "prescription": "8-10 reps",
    "equipment": [
      "table"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u9",
    "name": "Inverted Rows",
    "description": "Under a bar, pull chest up, body straight.",
    "category": "upper",
    "pattern": "row",
    "level": 2,
    "durationSeconds": 35,
    "prescription": "8-10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u27",
    "name": "Active Hang",
    "description": "Hang from bar, engage shoulders down.",
    "category": "upper",
    "pattern": "row",
    "level": 1,
    "durationSeconds": 45,
    "prescription": "30-45 sec",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u38",
    "name": "Scapular Pulls",
    "description": "Hang from bar with straight arms, pull shoulder blades down and together, then release.",
    "category": "upper",
    "pattern": "row",
    "level": 1,
    "durationSeconds": 35,
    "prescription": "10-12 reps",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u31",
    "name": "Pull-Up Negatives",
    "description": "Jump to the top of a pull-up, lower yourself as slowly as possible.",
    "category": "upper",
    "pattern": "row",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "5-8 reps",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u39",
    "name": "Chin-Ups",
    "description": "Underhand grip, pull chin over the bar. Easier than pull-ups thanks to more bicep involvement.",
    "category": "upper",
    "pattern": "row",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "5-10 reps",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u12",
    "name": "Pull-Ups",
    "description": "Overhand grip, pull chest to the bar.",
    "category": "upper",
    "pattern": "row",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "5-12 reps",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u32",
    "name": "Commando Pull-Ups",
    "description": "Grip bar side-on, pull head to alternate sides of the bar.",
    "category": "upper",
    "pattern": "row",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "6-8 per side",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u40",
    "name": "Archer Pull-Ups",
    "description": "Pull up while shifting your body toward one hand, keeping the other arm extended.",
    "category": "upper",
    "pattern": "row",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "4-6 per side",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u28",
    "name": "Muscle-Ups",
    "description": "Explosive pull up and transition over bar.",
    "category": "upper",
    "pattern": "row",
    "level": 4,
    "durationSeconds": 45,
    "prescription": "3-5 reps",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u25",
    "name": "Bench / Chair Dips",
    "description": "Hands on edge behind you, lower hips.",
    "category": "upper",
    "pattern": "dip",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "10-15 reps",
    "equipment": [
      "chair",
      "bench"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "triceps"
    ]
  },
  {
    "id": "u26",
    "name": "Parallel Bar Dips",
    "description": "Lower body between parallel bars/chairs.",
    "category": "upper",
    "pattern": "dip",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "8-12 reps",
    "equipment": [
      "chair"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "triceps"
    ]
  },
  {
    "id": "u6",
    "name": "Pike Shoulder Press",
    "description": "Feet on floor, inverted V shape press.",
    "category": "upper",
    "pattern": "vertical_push",
    "level": 1,
    "durationSeconds": 35,
    "prescription": "8-10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "anterior_shoulder"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "anterior_shoulder"
    ]
  },
  {
    "id": "u5",
    "name": "Elevated Pike Push-Ups",
    "description": "Feet on step, inverted V press.",
    "category": "upper",
    "pattern": "vertical_push",
    "level": 2,
    "durationSeconds": 35,
    "prescription": "8-10 reps",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "anterior_shoulder"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "anterior_shoulder"
    ]
  },
  {
    "id": "u41",
    "name": "Wall Handstand Hold",
    "description": "Kick up to a handstand against a wall, hold with straight arms and a tight core.",
    "category": "upper",
    "pattern": "vertical_push",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "20-30 sec",
    "equipment": [
      "wall"
    ],
    "primaryMuscles": [
      "anterior_shoulder"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "anterior_shoulder"
    ]
  },
  {
    "id": "u19",
    "name": "Wall Handstand Push-Ups",
    "description": "Kick up to wall, lower and press.",
    "category": "upper",
    "pattern": "vertical_push",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "5-8 reps",
    "equipment": [
      "wall"
    ],
    "primaryMuscles": [
      "anterior_shoulder"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "anterior_shoulder"
    ]
  },
  {
    "id": "u33",
    "name": "Frog Stand / Crow Pose",
    "description": "Balance knees on elbows, lift feet off the floor.",
    "category": "upper",
    "pattern": "static_push",
    "level": 2,
    "durationSeconds": 30,
    "prescription": "20-30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "anterior_shoulder"
    ],
    "secondaryMuscles": [
      "deep_core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "anterior_shoulder"
    ]
  },
  {
    "id": "u34",
    "name": "Planche Lean",
    "description": "Straight arm plank, lean shoulders far forward over hands.",
    "category": "upper",
    "pattern": "static_push",
    "level": 2,
    "durationSeconds": 30,
    "prescription": "20-30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "anterior_shoulder"
    ],
    "secondaryMuscles": [
      "deep_core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "anterior_shoulder"
    ]
  },
  {
    "id": "u13",
    "name": "Scapular Push-Ups",
    "description": "High plank, pinch and separate shoulder blades.",
    "category": "upper",
    "pattern": "scapula",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u14",
    "name": "Prone Lat Pulldowns",
    "description": "Face-down, pull elbows to ribs.",
    "category": "upper",
    "pattern": "back_ext",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "10-15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u15",
    "name": "Reverse Snow Angels",
    "description": "Face-down, hover hands, sweep arms.",
    "category": "upper",
    "pattern": "back_ext",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u17",
    "name": "Back Extensions",
    "description": "Face-down, lift chest using mid-back.",
    "category": "upper",
    "pattern": "back_ext",
    "level": 2,
    "durationSeconds": 35,
    "prescription": "12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u42",
    "name": "Straight Bridge",
    "description": "Lie on back, arms overhead, lift hips and chest while pressing shoulders and feet into the floor.",
    "category": "upper",
    "pattern": "spinal_bridge",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "20-30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "u43",
    "name": "Head Bridge (Wrestler's Bridge)",
    "description": "⚠️ Loads the neck directly. Plant feet and the crown of your head on the floor, lift hips high, supporting weight through feet and head. Build up gradually and stop immediately if you feel any neck strain.",
    "category": "upper",
    "pattern": "spinal_bridge",
    "level": 2,
    "durationSeconds": 35,
    "prescription": "15-20 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "neck"
    ],
    "optIn": "advancedBridges"
  },
  {
    "id": "u45",
    "name": "Manual Neck Isometrics",
    "description": "Press your head gently into your hand — forehead, back of head, then each side — holding steady resistance without moving your neck. No load beyond your own hand pressure.",
    "category": "upper",
    "pattern": "neck_iso",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "8 sec x 4 directions",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "neck"
    ]
  },
  {
    "id": "u46",
    "name": "Prone Neck Extension",
    "description": "Lie face-down, forehead resting on the floor. Lift your head a few inches, looking straight down throughout, then lower with control.",
    "category": "upper",
    "pattern": "neck_iso",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "12-15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "neck"
    ]
  },
  {
    "id": "u47",
    "name": "Neck Curl (Supine Flexion)",
    "description": "Lie on your back, chin gently tucked. Lift your head an inch or two off the floor and hold briefly, then lower slowly. Small range of motion — this isn't a sit-up.",
    "category": "upper",
    "pattern": "neck_iso",
    "level": 2,
    "durationSeconds": 30,
    "prescription": "10-12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "neck"
    ]
  },
  {
    "id": "u48",
    "name": "Front Lever Tuck",
    "description": "Hang from bar, pull knees to chest, and lean back until your torso is roughly horizontal.",
    "category": "upper",
    "pattern": "front_lever",
    "level": 3,
    "durationSeconds": 25,
    "prescription": "15-20 sec hold",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "core",
      "posterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u49",
    "name": "Front Lever Advanced Tuck",
    "description": "From the tuck position, extend your hips so thighs are parallel to the floor while keeping the torso horizontal.",
    "category": "upper",
    "pattern": "front_lever",
    "level": 4,
    "durationSeconds": 20,
    "prescription": "10-15 sec hold",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "core",
      "posterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u50",
    "name": "Front Lever (Straddle/Full)",
    "description": "Extend the legs straight (straddled or together), body fully horizontal, and hold.",
    "category": "upper",
    "pattern": "front_lever",
    "level": 5,
    "durationSeconds": 15,
    "prescription": "5-10 sec hold",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "core",
      "posterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u51",
    "name": "Back Lever Tuck",
    "description": "Hang from bar, invert, and tuck your knees to your chest so your body is horizontal, facing the floor.",
    "category": "upper",
    "pattern": "back_lever",
    "level": 3,
    "durationSeconds": 25,
    "prescription": "15-20 sec hold",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "core",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u54",
    "name": "Back Lever Advanced Tuck",
    "description": "From the tuck, extend your hips so thighs are parallel to the floor while keeping the body horizontal, facing the floor.",
    "category": "upper",
    "pattern": "back_lever",
    "level": 4,
    "durationSeconds": 20,
    "prescription": "10-15 sec hold",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "core",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u52",
    "name": "Back Lever (Straddle/Full)",
    "description": "From the tuck, extend the legs straight while keeping the body horizontal, facing the floor.",
    "category": "upper",
    "pattern": "back_lever",
    "level": 5,
    "durationSeconds": 15,
    "prescription": "5-10 sec hold",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "core",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u53",
    "name": "Handstand Walk",
    "description": "Kick up into a handstand against a wall or freestanding, then walk forward on your hands with small controlled steps.",
    "category": "upper",
    "pattern": "vertical_push",
    "level": 4,
    "durationSeconds": 30,
    "prescription": "5-10 steps",
    "equipment": [
      "bench",
      "wall"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "core",
      "triceps"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "shoulders"
    ]
  },
  {
    "id": "u44",
    "name": "Full Bridge (Wheel Pose)",
    "description": "⚠️ Deep spinal extension under load. From the floor, press through hands and feet into a full backbend, arms and legs extended. Warm up thoroughly and stop if you feel sharp or pinching pain.",
    "category": "upper",
    "pattern": "spinal_bridge",
    "level": 3,
    "durationSeconds": 35,
    "prescription": "10-15 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ],
    "optIn": "advancedBridges"
  },
  {
    "id": "u16",
    "name": "Plank Rows",
    "description": "High plank, row one hand up.",
    "category": "upper",
    "pattern": "row_plank",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "10 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "deep_core"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "u3",
    "name": "Decline Push-Ups",
    "description": "Feet elevated, pushing load to upper chest.",
    "category": "upper",
    "pattern": "pushup",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "10-12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u7",
    "name": "Staggered Push-Ups",
    "description": "Uneven hand placement.",
    "category": "upper",
    "pattern": "pushup",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "10-12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u8",
    "name": "Spiderman Push-Ups",
    "description": "Push-up bringing knee to elbow.",
    "category": "upper",
    "pattern": "pushup",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "8-10 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u35",
    "name": "Wide-Grip Push-Ups",
    "description": "Hands set wider than shoulders, lower chest to floor.",
    "category": "upper",
    "pattern": "pushup",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "10-12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u36",
    "name": "T Push-Ups",
    "description": "After each push-up, rotate into a side plank and reach top arm to ceiling.",
    "category": "upper",
    "pattern": "pushup",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "6-8 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "u37",
    "name": "Clap Push-Ups",
    "description": "Push up explosively enough for hands to leave the floor and clap.",
    "category": "upper",
    "pattern": "pushup",
    "level": 3,
    "durationSeconds": 35,
    "prescription": "6-8 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "anterior_shoulder"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "l8",
    "name": "Wall Sit",
    "description": "Back against wall, knees 90 degrees.",
    "category": "lower",
    "pattern": "squat",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "30-45 sec",
    "equipment": [
      "wall"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l24",
    "name": "Box Squats",
    "description": "Squat down until sitting on box, stand up.",
    "category": "lower",
    "pattern": "squat",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l1",
    "name": "Bodyweight Squats",
    "description": "Standard air squats.",
    "category": "lower",
    "pattern": "squat",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "15-20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l10",
    "name": "Sumo Squats",
    "description": "Wide stance squats.",
    "category": "lower",
    "pattern": "squat",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l30",
    "name": "Jump Squats",
    "description": "Squat down, explode up into a jump. Land softly.",
    "category": "lower",
    "pattern": "squat",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "10-15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l29",
    "name": "Horse Stance",
    "description": "Wide deep squat hold, chest up.",
    "category": "lower",
    "pattern": "squat",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "30-45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l4",
    "name": "Cossack Squats",
    "description": "Wide stance, deep lateral shift.",
    "category": "lower",
    "pattern": "squat",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "8 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l23",
    "name": "Sissy Squats",
    "description": "Lean torso straight back, drive knees forward.",
    "category": "lower",
    "pattern": "squat",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "10-12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l2",
    "name": "Reverse Lunges",
    "description": "Step backward into lunge.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 1,
    "durationSeconds": 60,
    "prescription": "16-20 reps",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l7",
    "name": "Step-Ups",
    "description": "Step onto box/chair.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 1,
    "durationSeconds": 50,
    "prescription": "10 per leg",
    "equipment": [
      "chair",
      "bench"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l5",
    "name": "Curtsy Lunges",
    "description": "Diagonal backward lunge.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 1,
    "durationSeconds": 50,
    "prescription": "10 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l28",
    "name": "Walking Lunges",
    "description": "Lunge forward continuously.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 2,
    "durationSeconds": 60,
    "prescription": "20 steps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l3",
    "name": "Bulgarian Split Squats",
    "description": "Rear foot elevated lunge.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 2,
    "durationSeconds": 60,
    "prescription": "10 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l9",
    "name": "Assisted Pistol Squats",
    "description": "Single leg squat holding support.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "6-8 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l31",
    "name": "Jumping Lunges",
    "description": "Lunge down, jump and switch legs in mid-air.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "16-20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l32",
    "name": "Airborne Lunges",
    "description": "Single leg squat, drop back knee to floor without back foot touching.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "6-8 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l21",
    "name": "Shrimp Squats",
    "description": "Hold ankle behind, tap knee to floor.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 3,
    "durationSeconds": 50,
    "prescription": "6-8 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l25",
    "name": "Calf Raises",
    "description": "Press up onto toes, lower slowly.",
    "category": "lower",
    "pattern": "calf",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "15-20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "calves"
    ]
  },
  {
    "id": "l33",
    "name": "Seated Calf Raises",
    "description": "Sit on a chair or bench, feet flat, press up onto your toes and lower with control. Targets the calf differently than standing raises.",
    "category": "lower",
    "pattern": "calf",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "20 reps",
    "equipment": [
      "chair",
      "bench"
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "calves"
    ]
  },
  {
    "id": "l34",
    "name": "Single-Leg Calf Raises",
    "description": "Standing on one foot, press up onto your toes and lower slowly. Hold a wall for balance if needed.",
    "category": "lower",
    "pattern": "calf",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "12-15 per leg",
    "equipment": [
      "wall"
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "calves"
    ]
  },
  {
    "id": "l27",
    "name": "Copenhagen Planks",
    "description": "Side plank with top leg resting on bench.",
    "category": "lower",
    "pattern": "adductor",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "20-30 sec",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "adductors"
    ],
    "secondaryMuscles": [
      "deep_core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "adductors"
    ]
  },
  {
    "id": "l36",
    "name": "Standing Adductor Squeeze",
    "description": "Place a ball, cushion, or rolled towel between your knees while standing or seated. Squeeze inward and hold for a couple of seconds, then release.",
    "category": "lower",
    "pattern": "adductor",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "adductors"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "adductors"
    ]
  },
  {
    "id": "l37",
    "name": "Side-Lying Inner Thigh Lifts",
    "description": "Lie on your side, top leg bent with foot flat in front of you. Lift the bottom (straight) leg toward the ceiling, then lower with control.",
    "category": "lower",
    "pattern": "adductor",
    "level": 1,
    "durationSeconds": 35,
    "prescription": "12-15 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "adductors"
    ],
    "secondaryMuscles": [
      "obliques"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "adductors"
    ]
  },
  {
    "id": "l38",
    "name": "Pistol Squat",
    "description": "Full single-leg squat with no support — opposite leg extended out in front, sit back and down, then drive up.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 3,
    "durationSeconds": 50,
    "prescription": "5-8 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l39",
    "name": "Box Jumps",
    "description": "Jump onto a sturdy box or step, landing softly with bent knees. Step back down — don't jump down.",
    "category": "lower",
    "pattern": "plyo",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "8-10 reps",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes",
      "calves"
    ],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l40",
    "name": "Broad Jumps",
    "description": "Jump forward as far as you can, landing softly with bent knees. Reset fully before the next rep.",
    "category": "lower",
    "pattern": "plyo",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "6-8 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "quads",
      "hamstrings"
    ],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "glutes"
    ]
  },
  {
    "id": "l41",
    "name": "Depth Jumps",
    "description": "Step off a low box, and the instant you land, explode straight up into a vertical jump.",
    "category": "lower",
    "pattern": "plyo",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "6-8 reps",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes",
      "calves"
    ],
    "unilateral": false,
    "lowImpact": false,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l42",
    "name": "Tibialis Raises",
    "description": "Lean back against a wall with heels forward, feet flat. Lift your toes up toward your shins, then lower.",
    "category": "lower",
    "pattern": "tibialis",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "15-20 reps",
    "equipment": [
      "wall"
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "calves"
    ]
  },
  {
    "id": "l11",
    "name": "Glute Bridges",
    "description": "Bridge hips up.",
    "category": "lower",
    "pattern": "glute",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "15-20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "glutes"
    ]
  },
  {
    "id": "l16",
    "name": "Frog Pumps",
    "description": "Bridge with soles of feet together.",
    "category": "lower",
    "pattern": "glute",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "glutes"
    ]
  },
  {
    "id": "l13",
    "name": "Donkey Kicks",
    "description": "All fours, drive heel up.",
    "category": "lower",
    "pattern": "glute",
    "level": 1,
    "durationSeconds": 50,
    "prescription": "12 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "glutes"
    ]
  },
  {
    "id": "l19",
    "name": "Clamshells",
    "description": "Side-lying hip rotation.",
    "category": "lower",
    "pattern": "glute",
    "level": 1,
    "durationSeconds": 50,
    "prescription": "12 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "glutes"
    ]
  },
  {
    "id": "l12",
    "name": "Single-Leg Glute Bridge",
    "description": "One foot planted bridge.",
    "category": "lower",
    "pattern": "glute",
    "level": 2,
    "durationSeconds": 50,
    "prescription": "10 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "glutes"
    ]
  },
  {
    "id": "l20",
    "name": "Hip Thrusts",
    "description": "Shoulders elevated bridge.",
    "category": "lower",
    "pattern": "glute",
    "level": 2,
    "durationSeconds": 50,
    "prescription": "15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "glutes"
    ]
  },
  {
    "id": "l18",
    "name": "Prisoner Good Mornings",
    "description": "Hinge at hips, hands behind head.",
    "category": "lower",
    "pattern": "hinge",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "glutes",
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "hamstrings"
    ]
  },
  {
    "id": "l14",
    "name": "Single-Leg Romanian Deadlift",
    "description": "Single leg hip hinge.",
    "category": "lower",
    "pattern": "hinge",
    "level": 2,
    "durationSeconds": 50,
    "prescription": "10 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "glutes",
      "lower_back"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "hamstrings"
    ]
  },
  {
    "id": "l17",
    "name": "Reverse Hyperextensions",
    "description": "Hips on edge, lift legs straight.",
    "category": "lower",
    "pattern": "hinge",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "12-15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "glutes",
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "hamstrings"
    ]
  },
  {
    "id": "l26",
    "name": "Reverse Nordics",
    "description": "Kneel, lean torso straight back to load quads.",
    "category": "lower",
    "pattern": "quad",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "8-10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l15",
    "name": "Sliding Leg Curls",
    "description": "Bridge, slide feet out and in.",
    "category": "lower",
    "pattern": "hamstring",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "10-12 reps",
    "equipment": [
      "slider"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "hamstrings"
    ]
  },
  {
    "id": "l22",
    "name": "Nordic Hamstring Curls",
    "description": "Kneeling, lower torso using hamstrings.",
    "category": "lower",
    "pattern": "hamstring",
    "level": 3,
    "durationSeconds": 50,
    "prescription": "5-8 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "hamstrings"
    ]
  },
  {
    "id": "l6",
    "name": "Lateral Lunges",
    "description": "Side lunges.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 1,
    "durationSeconds": 50,
    "prescription": "10 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "k1",
    "name": "Dead Bugs",
    "description": "Lower back flat, alternate arm/leg ext.",
    "category": "core",
    "pattern": "core_anti_ext",
    "level": 1,
    "durationSeconds": 60,
    "prescription": "16 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k5",
    "name": "Hollow Body Hold",
    "description": "Banana shape hold on floor.",
    "category": "core",
    "pattern": "core_anti_ext",
    "level": 2,
    "durationSeconds": 25,
    "prescription": "20-30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k20",
    "name": "Hollow Body Rocks",
    "description": "Hold hollow body position and rock back and forth.",
    "category": "core",
    "pattern": "core_anti_ext",
    "level": 2,
    "durationSeconds": 30,
    "prescription": "15-20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k14",
    "name": "L-Sit Hold",
    "description": "Lift body, legs straight in front.",
    "category": "core",
    "pattern": "core_anti_ext",
    "level": 3,
    "durationSeconds": 30,
    "prescription": "15-20 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k15",
    "name": "Dragon Flags",
    "description": "Lift straight body off bench.",
    "category": "core",
    "pattern": "core_anti_ext",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "6-8 reps",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k4",
    "name": "Side Plank",
    "description": "Static side hold.",
    "category": "core",
    "pattern": "core_plank",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "obliques"
    ],
    "secondaryMuscles": [
      "deep_core"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "obliques"
    ]
  },
  {
    "id": "k21",
    "name": "Forearm Plank",
    "description": "Forearms and toes on floor, body in a straight line from head to heels.",
    "category": "core",
    "pattern": "core_plank",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "30-45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k3",
    "name": "Alternating Side Plank",
    "description": "Rotate side to side.",
    "category": "core",
    "pattern": "core_plank",
    "level": 2,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "obliques"
    ],
    "secondaryMuscles": [
      "deep_core"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "obliques"
    ]
  },
  {
    "id": "k6",
    "name": "Plank Shoulder Taps",
    "description": "High plank, tap shoulders.",
    "category": "core",
    "pattern": "core_plank",
    "level": 2,
    "durationSeconds": 30,
    "prescription": "16 taps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [
      "obliques"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k2",
    "name": "Reverse Plank",
    "description": "Chest up plank.",
    "category": "core",
    "pattern": "core_plank",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "30-45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [
      "obliques"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k13",
    "name": "Plank to Downward Dog",
    "description": "Pike hips up and down.",
    "category": "core",
    "pattern": "core_plank",
    "level": 1,
    "durationSeconds": 35,
    "prescription": "10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [
      "obliques"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k22",
    "name": "Plank Jacks",
    "description": "From a high plank, jump feet out and in like a jumping jack.",
    "category": "core",
    "pattern": "core_plank",
    "level": 2,
    "durationSeconds": 35,
    "prescription": "20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [
      "obliques"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k23",
    "name": "Plank Up-Downs",
    "description": "Alternate between forearm plank and high plank, one arm at a time.",
    "category": "core",
    "pattern": "core_plank",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "10-12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [
      "obliques"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  },
  {
    "id": "k24",
    "name": "Side Plank with Leg Lift",
    "description": "Hold a side plank while raising and lowering the top leg.",
    "category": "core",
    "pattern": "core_plank",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "10 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "obliques"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "obliques"
    ]
  },
  {
    "id": "k8",
    "name": "Russian Twists",
    "description": "Rotate torso, tap floor.",
    "category": "core",
    "pattern": "core_flex",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k9",
    "name": "Bicycle Crunches",
    "description": "Opposite knee to elbow.",
    "category": "core",
    "pattern": "core_flex",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k25",
    "name": "Crunches",
    "description": "Lie on back, knees bent, curl shoulders up toward hips.",
    "category": "core",
    "pattern": "core_flex",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k26",
    "name": "Reverse Crunches",
    "description": "Lie on back, curl hips up bringing knees toward chest.",
    "category": "core",
    "pattern": "core_flex",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "15-20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k28",
    "name": "Flutter Kicks",
    "description": "Lie on back, legs straight, small alternating up-down kicks.",
    "category": "core",
    "pattern": "core_flex",
    "level": 1,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k27",
    "name": "Lying Leg Raises",
    "description": "Lie flat, legs straight, lift to vertical then lower slowly without touching down.",
    "category": "core",
    "pattern": "core_flex",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k29",
    "name": "Scissor Kicks",
    "description": "Lie on back, legs straight and slightly raised, cross one over the other rapidly.",
    "category": "core",
    "pattern": "core_flex",
    "level": 2,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k16",
    "name": "Hanging Knee Raises",
    "description": "Hang from bar, tuck knees to chest.",
    "category": "core",
    "pattern": "core_flex",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "10-15 reps",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k17",
    "name": "V-Ups",
    "description": "Lie flat, fold body to touch toes in V shape.",
    "category": "core",
    "pattern": "core_flex",
    "level": 2,
    "durationSeconds": 40,
    "prescription": "12-15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k7",
    "name": "Tuck Hold",
    "description": "Hands by hips, tuck knees off floor.",
    "category": "core",
    "pattern": "core_flex",
    "level": 2,
    "durationSeconds": 18,
    "prescription": "15-20 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k19",
    "name": "Windshield Wipers",
    "description": "Lie on back, legs straight up, drop side to side.",
    "category": "core",
    "pattern": "core_flex",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "10-12 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k30",
    "name": "Hanging Leg Raises",
    "description": "Hang from a bar, keep legs straight, raise them to hip height or higher.",
    "category": "core",
    "pattern": "core_flex",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "8-12 reps",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "k11",
    "name": "Bird Dog",
    "description": "All fours, alternate extension.",
    "category": "core",
    "pattern": "core_post",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "10 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "k18",
    "name": "Swimmers",
    "description": "Face down, flutter straight arms and legs.",
    "category": "core",
    "pattern": "core_post",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "20 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "k31",
    "name": "Alternating Superman",
    "description": "Face-down, lift opposite arm and leg together, alternate sides.",
    "category": "core",
    "pattern": "core_post",
    "level": 1,
    "durationSeconds": 40,
    "prescription": "12 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "k33",
    "name": "Bird Dog with Pause",
    "description": "All fours, extend opposite arm and leg, hold 2-3 seconds at full extension before switching.",
    "category": "core",
    "pattern": "core_post",
    "level": 2,
    "durationSeconds": 45,
    "prescription": "8 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "k10",
    "name": "Superman Hold",
    "description": "Face-down, lift chest and legs.",
    "category": "core",
    "pattern": "core_post",
    "level": 2,
    "durationSeconds": 30,
    "prescription": "10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "k12",
    "name": "Hamstring Walkouts",
    "description": "Walk feet out from bridge.",
    "category": "core",
    "pattern": "core_post",
    "level": 2,
    "durationSeconds": 35,
    "prescription": "6-8 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "k32",
    "name": "Superman Pulses",
    "description": "Face-down, lift chest and legs, then pulse a few inches up and down.",
    "category": "core",
    "pattern": "core_post",
    "level": 3,
    "durationSeconds": 30,
    "prescription": "20-30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "k34",
    "name": "Bird Dog Crunch",
    "description": "All fours, extend opposite arm and leg, then crunch elbow to knee underneath your torso.",
    "category": "core",
    "pattern": "core_post",
    "level": 3,
    "durationSeconds": 45,
    "prescription": "8 per side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "k35",
    "name": "Toes-to-Bar",
    "description": "Hang from a bar, keep legs straight, and raise your feet all the way up to touch the bar.",
    "category": "core",
    "pattern": "core_flex",
    "level": 3,
    "durationSeconds": 40,
    "prescription": "6-10 reps",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "rectus_abdominis"
    ],
    "secondaryMuscles": [
      "hip_flexors"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "rectus_abdominis"
    ]
  },
  {
    "id": "m1",
    "name": "Cat-Cow",
    "description": "Arch and round spine.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "60 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "core",
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m2",
    "name": "Child's Pose",
    "description": "Hips to heels, reach forward.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "hips",
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m3",
    "name": "Thread the Needle",
    "description": "Slide arm under torso.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "slider"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m4",
    "name": "Supine Spinal Twist",
    "description": "Lie on back, drop knees.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "hips"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "core"
    ]
  },
  {
    "id": "m5",
    "name": "Standing Quad Stretch",
    "description": "Pull heel to glute.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m6",
    "name": "Standing Hamstring Stretch",
    "description": "Hinge over straight leg.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m7",
    "name": "Standing Calf Stretch",
    "description": "Lean into wall, heel down.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "wall"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m8",
    "name": "Standing Forward Fold",
    "description": "Hinge at hips, hang.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [
      "upper_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m9",
    "name": "Seated Forward Fold",
    "description": "Reach for feet seated.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [
      "upper_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m10",
    "name": "Pigeon Pose",
    "description": "Knee forward, extend other leg.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m11",
    "name": "Seated Hamstring Stretch",
    "description": "Fold over single straight leg.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m12",
    "name": "Kneeling Hip Flexor Stretch",
    "description": "Kneel, tuck pelvis.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m13",
    "name": "Half-Kneeling Hip Flexor with Reach",
    "description": "Kneel, tuck, reach overhead.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m14",
    "name": "Lizard Pose",
    "description": "Deep lunge, forearms to floor.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m15",
    "name": "Frog Stretch",
    "description": "Knees wide, sink hips.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "60 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m16",
    "name": "Butterfly Stretch",
    "description": "Soles together, knees down.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m17",
    "name": "Happy Baby",
    "description": "On back, grab feet.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m18",
    "name": "Standing Figure-4 Stretch",
    "description": "Cross ankle over knee, sit back.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m19",
    "name": "Reclined Figure-4 Stretch",
    "description": "On back, ankle over knee.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m20",
    "name": "Standing IT Band Stretch",
    "description": "Cross legs, lean hips out.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m21",
    "name": "Wide-Leg Forward Fold",
    "description": "Wide stance, fold forward.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [
      "hips"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m22",
    "name": "Cobra Stretch",
    "description": "Face down, press chest up.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "upper_back",
      "core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "m23",
    "name": "Sphinx Pose",
    "description": "On forearms, arch lower back.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "lower_back"
    ],
    "secondaryMuscles": [
      "upper_back",
      "core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "lower_back"
    ]
  },
  {
    "id": "m24",
    "name": "Doorway Chest Stretch",
    "description": "Forearms in door, lean forward.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "m25",
    "name": "Wide-Arm Doorway Stretch",
    "description": "High arms in door.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "m26",
    "name": "Puppy Pose",
    "description": "All fours, reach forward, sink chest.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m27",
    "name": "Cow Face Arms",
    "description": "Link hands behind back.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "shoulders"
    ]
  },
  {
    "id": "m28",
    "name": "Eagle Arms",
    "description": "Cross arms, lift elbows.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m29",
    "name": "Cross-Body Shoulder Stretch",
    "description": "Pull straight arm across chest.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "shoulders"
    ]
  },
  {
    "id": "m30",
    "name": "Overhead Triceps Stretch",
    "description": "Hand behind neck, pull elbow.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "shoulders"
    ]
  },
  {
    "id": "m31",
    "name": "Neck Side Stretch",
    "description": "Ear to shoulder.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 40,
    "prescription": "20 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "neck"
    ]
  },
  {
    "id": "m32",
    "name": "Neck Retractions & Tilts",
    "description": "Chin tucks + tilts.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "neck"
    ]
  },
  {
    "id": "m33",
    "name": "Neck Circles & Tilts",
    "description": "Circle head slowly.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "neck"
    ]
  },
  {
    "id": "m34",
    "name": "Standing Side Bend",
    "description": "Reach up and over.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "core",
      "lower_back"
    ],
    "secondaryMuscles": [
      "upper_back"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "core",
      "lower_back"
    ]
  },
  {
    "id": "m35",
    "name": "Deep Squat Hold",
    "description": "Sit deep, press knees out.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "60 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [
      "legs"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "m36",
    "name": "Kneeling Lat Stretch",
    "description": "Hands on bench, sink hips.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "bench"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m37",
    "name": "Seated Spinal Twist",
    "description": "Cross leg, twist torso.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "core",
      "lower_back"
    ],
    "secondaryMuscles": [
      "upper_back"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "core",
      "lower_back"
    ]
  },
  {
    "id": "m38",
    "name": "Wall Angels",
    "description": "Back and head against a wall, arms at 90 degrees, slide them up and down to open the chest.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "wall",
      "slider"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "upper_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "m39",
    "name": "Shoulder & Chest Opener",
    "description": "Clasp hands behind back.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "m40",
    "name": "Standing Chest Opener",
    "description": "Clasp hands, lift slightly.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "m41",
    "name": "Prone Y-T-W Raises",
    "description": "Face down arm lifts.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "8 reps each",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m42",
    "name": "Massage Gun Sweep",
    "description": "Sweep chest and shoulder.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 120,
    "prescription": "60 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "m43",
    "name": "The Gravity Drop",
    "description": "Lie on roller, open arms.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "m44",
    "name": "Doorway Pectoral Stretch",
    "description": "Forearm in frame, twist away.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "chest"
    ]
  },
  {
    "id": "m45",
    "name": "Supported Rest",
    "description": "Legs up wall, breathe.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 300,
    "prescription": "5 min",
    "equipment": [
      "wall"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "m46",
    "name": "Levator Stretch",
    "description": "Look to armpit, slight pressure.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 40,
    "prescription": "20 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "neck"
    ]
  },
  {
    "id": "m47",
    "name": "Thoracic Extension",
    "description": "Arch upper back over roller.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "10 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m48",
    "name": "Chin Tucks",
    "description": "Draw chin straight back.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 30,
    "prescription": "30 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "neck"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "neck"
    ]
  },
  {
    "id": "m49",
    "name": "Band Pull-Aparts",
    "description": "Pull band apart.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 40,
    "prescription": "15 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_body"
    ]
  },
  {
    "id": "m50",
    "name": "Downward Facing Dog",
    "description": "Inverted V, press heels down and chest to thighs.",
    "category": "mobility",
    "pattern": "yoga",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back"
    ],
    "secondaryMuscles": [
      "legs",
      "lower_back"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back"
    ]
  },
  {
    "id": "m51",
    "name": "Warrior I",
    "description": "Deep lunge, back foot flat, arms overhead.",
    "category": "mobility",
    "pattern": "yoga",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [
      "hips"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m52",
    "name": "Warrior II",
    "description": "Deep lunge, hips open, arms parallel to floor.",
    "category": "mobility",
    "pattern": "yoga",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [
      "hips"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m53",
    "name": "Triangle Pose",
    "description": "Straight legs, hinge sideways, hand to ankle.",
    "category": "mobility",
    "pattern": "yoga",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m54",
    "name": "Tree Pose",
    "description": "Balance on one leg, foot on inner thigh, hands up.",
    "category": "mobility",
    "pattern": "yoga",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec / side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m55",
    "name": "Chair Pose",
    "description": "Feet together, sink hips back, arms extended up.",
    "category": "mobility",
    "pattern": "yoga",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "60 sec",
    "equipment": [
      "chair"
    ],
    "primaryMuscles": [
      "legs"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "legs"
    ]
  },
  {
    "id": "m56",
    "name": "Upward Facing Dog",
    "description": "Hips hover off floor, press chest up tall.",
    "category": "mobility",
    "pattern": "yoga",
    "level": 0,
    "durationSeconds": 45,
    "prescription": "45 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "upper_back",
      "lower_back"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "upper_back",
      "lower_back"
    ]
  },
  {
    "id": "m57",
    "name": "Savasana (Corpse Pose)",
    "description": "Lie flat on back, fully relax all muscles.",
    "category": "mobility",
    "pattern": "yoga",
    "level": 0,
    "durationSeconds": 180,
    "prescription": "3 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "full_body"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "full_body"
    ]
  },
  {
    "id": "m58",
    "name": "Wrist Flexor & Extensor Stretch",
    "description": "Extend one arm out, gently pull fingers back toward you, then pull them down — stretching both sides of the wrist.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 40,
    "prescription": "20 sec/side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "triceps"
    ]
  },
  {
    "id": "m59",
    "name": "Ankle Dorsiflexion Stretch",
    "description": "Kneel in a half-lunge, drive the front knee forward over the toes while keeping the heel flat on the floor.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec/side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "calves"
    ]
  },
  {
    "id": "m60",
    "name": "90/90 Hip Stretch",
    "description": "Sit with the front leg bent 90°, back leg bent 90° behind you, and lean forward over the front shin.",
    "category": "mobility",
    "pattern": "mob",
    "level": 0,
    "durationSeconds": 60,
    "prescription": "30 sec/side",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hips"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "hips"
    ]
  },
  {
    "id": "b1",
    "name": "Box Breathing",
    "description": "Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat.",
    "category": "mindfulness",
    "pattern": "breath",
    "level": 0,
    "durationSeconds": 120,
    "prescription": "2 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b2",
    "name": "4-7-8 Breathing",
    "description": "Inhale 4 counts, hold 7, exhale slowly for 8.",
    "category": "mindfulness",
    "pattern": "breath",
    "level": 0,
    "durationSeconds": 90,
    "prescription": "90 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b3",
    "name": "Diaphragmatic Breathing",
    "description": "One hand on chest, one on belly. Breathe so only the belly hand rises.",
    "category": "mindfulness",
    "pattern": "breath",
    "level": 0,
    "durationSeconds": 120,
    "prescription": "2 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b4",
    "name": "Extended Exhale Breathing",
    "description": "Inhale for 4 counts, exhale for 8. Slows the nervous system down.",
    "category": "mindfulness",
    "pattern": "breath",
    "level": 0,
    "durationSeconds": 90,
    "prescription": "90 sec",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b5",
    "name": "Body Scan Meditation",
    "description": "Slowly bring attention from feet to head, noticing sensation without judgment.",
    "category": "mindfulness",
    "pattern": "meditation",
    "level": 0,
    "durationSeconds": 300,
    "prescription": "5 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b6",
    "name": "Progressive Muscle Relaxation",
    "description": "Tense each muscle group for 5 seconds, then release and notice the relaxation.",
    "category": "mindfulness",
    "pattern": "meditation",
    "level": 0,
    "durationSeconds": 240,
    "prescription": "4 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b7",
    "name": "Loving-Kindness Meditation",
    "description": "Silently offer goodwill first to yourself, then to others.",
    "category": "mindfulness",
    "pattern": "meditation",
    "level": 0,
    "durationSeconds": 180,
    "prescription": "3 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b8",
    "name": "Mindful Breath Counting",
    "description": "Count each exhale up to 10, then start over. Restart if you lose count.",
    "category": "mindfulness",
    "pattern": "meditation",
    "level": 0,
    "durationSeconds": 180,
    "prescription": "3 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b9",
    "name": "Gratitude Reflection",
    "description": "Bring to mind three things you're grateful for, and sit with each one.",
    "category": "mindfulness",
    "pattern": "reflection",
    "level": 0,
    "durationSeconds": 120,
    "prescription": "2 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b10",
    "name": "Open Awareness Sitting",
    "description": "Sit quietly and simply notice thoughts, sounds, and sensations as they arise.",
    "category": "mindfulness",
    "pattern": "meditation",
    "level": 0,
    "durationSeconds": 180,
    "prescription": "3 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b11",
    "name": "Mindful Body Check-In",
    "description": "Notice areas of tension without trying to change them, just observe.",
    "category": "mindfulness",
    "pattern": "reflection",
    "level": 0,
    "durationSeconds": 90,
    "prescription": "90 sec",
    "equipment": [
      "bar"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "b12",
    "name": "Visualization: Safe Place",
    "description": "Picture a calm, safe place in vivid detail using all five senses.",
    "category": "mindfulness",
    "pattern": "meditation",
    "level": 0,
    "durationSeconds": 180,
    "prescription": "3 min",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "mind"
    ],
    "secondaryMuscles": [],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "mobility",
      "general"
    ],
    "contraindications": [
      "mind"
    ]
  },
  {
    "id": "l43",
    "name": "Dragon Pistol Squats",
    "description": "Advanced single-leg squat where the non-working leg is tucked tightly behind the working calf.",
    "category": "lower",
    "pattern": "split_squat",
    "level": 4,
    "durationSeconds": 50,
    "prescription": "5-8 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "quads"
    ]
  },
  {
    "id": "l44",
    "name": "One-Arm Single-Leg RDL",
    "description": "Asymmetric single-leg deadlift requiring extreme core and hip stability to resist rotation.",
    "category": "lower",
    "pattern": "hinge",
    "level": 4,
    "durationSeconds": 50,
    "prescription": "6-8 per leg",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "glutes",
      "lower_back"
    ],
    "unilateral": true,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "hamstrings"
    ]
  },
  {
    "id": "k36",
    "name": "Standing Ab Rollouts",
    "description": "Full extension rollout from the feet, requiring extreme core tension to prevent lower back arching.",
    "category": "core",
    "pattern": "core_anti_ext",
    "level": 4,
    "durationSeconds": 40,
    "prescription": "5-8 reps",
    "equipment": [
      "none"
    ],
    "primaryMuscles": [
      "deep_core"
    ],
    "secondaryMuscles": [
      "rectus_abdominis"
    ],
    "unilateral": false,
    "lowImpact": true,
    "goals": [
      "strength",
      "muscle",
      "general"
    ],
    "contraindications": [
      "deep_core"
    ]
  }
]
