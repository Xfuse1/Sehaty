const AIRTABLE_TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
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