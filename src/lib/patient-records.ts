const AIRTABLE_TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const AIRTABLE_PATIENTS_TABLE = 'Patients Images';

export const savePatientPrescription = async (patientId: string, patientName: string, imageUrl: string) => {
  try {
    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      throw new Error('Airtable configuration is missing. Please check your environment variables.');
    }

    console.log('Saving to Airtable with data:', { 
      patientId, 
      patientName, 
      baseId: AIRTABLE_BASE_ID,
      table: AIRTABLE_PATIENTS_TABLE 
    });
    
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PATIENTS_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              'Patient_ID': patientId,  // This is the user.uid from Firebase
              'Patient_Name': patientName,
              'Attachments': [
                {
                  url: imageUrl,
                  filename: `prescription_${patientId}_${Date.now()}.jpg`
                }
              ],
            },
          },
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Airtable Error Response:', data);
      throw new Error(`Failed to save to Airtable: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error('Error saving to Airtable:', error);
    throw error;
  }
};