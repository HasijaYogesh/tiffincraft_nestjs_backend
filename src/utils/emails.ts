import * as  SibApiV3Sdk from 'sib-api-v3-sdk';
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.EMAIL_API_KEY;

export const sendEmail = (sendTo: any, templateId: any, params: any) => {
    return new Promise(async function (resolve, reject)
  {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

    sendSmtpEmail = {
        to: sendTo,
        templateId: parseInt(templateId),
        params: params,
        headers: {
            'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
        }
    };

    apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data: any) {
        console.log('API called successfully. Returned data: ', data);
        return resolve(true);
    }, function(error: any) {
        console.error(error);
        return resolve(false);
    });   
  });
}