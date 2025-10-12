const AIRTABLE_TOKEN = 'patdY7UWLUxinpwUW.f570ca2ced2658324371846d25d7bd84b6f8c5e406b2270b87f4710a4d19d92c';
const AIRTABLE_BASE_ID = 'appq8kl7k1W5U00Ig';
const AIRTABLE_TABLE = 'Doctors Images';

export const saveToAirtable = async (doctorId: string, doctorName: string, imageUrl: string) => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              'Doctor ID': doctorId,
              'Doctor Name': doctorName,
              'Attachments': [
                {
                  url: imageUrl,
                  filename: `doctor_${doctorId}.jpg`
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