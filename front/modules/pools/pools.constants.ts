import { PoolType } from "./pools.typedefs"

export const poolDescriptions = {
  [PoolType.Newborns]: `Every year, millions of newborns die within their first month of life due to preventable causes like birth asphyxia, infections, and complications from premature birth. By funding neonatal care, we can provide life-saving interventions such as incubators, skilled birth attendants, and essential medicines.`,
  [PoolType.RespiratoryInfections]:
    "Pneumonia and other respiratory infections claim the lives of hundreds of thousands of children every year, often because of delayed treatment and lack of antibiotics. Supporting this cause ensures timely medical interventions, oxygen therapy, and improved access to vaccinations.",
  [PoolType.DiarrhealDiseases]:
    "Unsafe drinking water and poor sanitation contribute to deadly diarrheal diseases, leading to severe dehydration and malnutrition, especially in children. Investing in clean water initiatives, sanitation infrastructure, and oral rehydration therapy can save lives.",
  [PoolType.Malaria]:
    "Malaria is one of the leading causes of death among young children in many regions, despite being preventable and treatable. By supporting mosquito net distribution, rapid testing, and effective treatment programs, we can significantly reduce malaria-related deaths.",
  [PoolType.Tuberculosis]:
    "Tuberculosis continues to devastate communities, particularly with drug-resistant strains on the rise. Funding TB programs helps provide early detection, access to treatment, and support for affected individuals to prevent the disease from spreading.",
  [PoolType.HIV]:
    "While HIV-related deaths have declined, the virus still affects millions, including newborns infected at birth. Supporting prevention, access to antiretroviral therapy, and education programs can help eliminate mother-to-child transmission and improve long-term outcomes.",
}

export const poolTitles = {
  [PoolType.Newborns]:
    "Give Newborns a Fighting Chance – Support Neonatal Care",
  [PoolType.RespiratoryInfections]:
    "Breathe Life into Children – Combat Respiratory Infections",
  [PoolType.DiarrhealDiseases]:
    "Safe Water, Healthy Lives – Prevent Deadly Diarrheal Diseases",
  [PoolType.Malaria]: "Defeat Malaria – Protect the Most Vulnerable",
  [PoolType.Tuberculosis]: "Stop Tuberculosis – End the Silent Epidemic",
  [PoolType.HIV]: "End HIV, Save Lives – Support Prevention & Treatment",
}
