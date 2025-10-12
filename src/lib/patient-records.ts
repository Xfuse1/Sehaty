const AIRTABLE_TOKEN = 'patdY7UWLUxinpwUW.f570ca2ced2658324371846d25d7bd84b6f8c5e406b2270b87f4710a4d19d92c';
const AIRTABLE_BASE_ID = 'appq8kl7k1W5U00Ig';
const AIRTABLE_PATIENTS_TABLE = 'Patients Images';

export const savePatientPrescription = async (patientId: string, patientName: string, imageUrl: string) => {
  try {
    console.log('Saving to Airtable with data:', { patientId, patientName, imageUrl });
    
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