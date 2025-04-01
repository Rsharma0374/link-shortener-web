import { encryptAES, decryptAES } from "./CryptoUtils"
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10008';
const PRODUCT_NAME = import.meta.env.VITE_PRODUCT_NAME || 'URL_SHORTENER';

export const login = async (identifier, bCryptPassword) => {

    const mappedDetails = {
        sUserIdentifier: identifier,
        sSHAPassword: bCryptPassword,
        sProductName: PRODUCT_NAME,
    };

    // const encryptedData = await encryptionService.encrypt(JSON.stringify(mappedDetails));
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));

    const response = await fetch(`${API_URL}/auth/user-login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'sKeyId': sessionStorage.getItem('KEY_ID')
        },
        body: JSON.stringify({ encryptedPayload: encryptedData }),
    });

    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;

    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
};

export const validate2FAOTP = async (otp, otpId, username) => {

    const mappedDetails = {
        sOtp: otp,
        sOtpId: otpId,
        sUserName: username,
        sProductName: PRODUCT_NAME,
    };

    // const encryptedData = await encryptionService.encrypt(JSON.stringify(mappedDetails));
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));

    const response = await fetch(`${API_URL}/auth/validate-tfa-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'sKeyId': sessionStorage.getItem('KEY_ID')
        },
        body: JSON.stringify({ encryptedPayload: encryptedData }),
    });

    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;

    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
};


export const signup = async (formData) => {

    const mappedDetails = {
        sUserName: formData.username,
        sEmail: formData.email,
        sPassword: formData.password,
        sFullName: formData.name,
        sProductName: PRODUCT_NAME,
    };

    const encryptedData = encryptAES(JSON.stringify(mappedDetails));

    const response = await fetch(`${API_URL}/auth/create-user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'sKeyId': sessionStorage.getItem('KEY_ID')
        },
        body: JSON.stringify({ encryptedPayload: encryptedData }),
    });

    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;

    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
};


export const sendEmailVerificationOTP = async (email, emailType) => {

    const mappedDetails = {
        sEmailId: email,
        sEmailType: emailType,
        bOtpRequired: true,
        sProductName: PRODUCT_NAME,
    };
    // const encryptedData = await encryptionService.encrypt(JSON.stringify(mappedDetails));
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));

    const response = await fetch(`${API_URL}/communications/send-email-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'sKeyId': sessionStorage.getItem('KEY_ID')
        },
        body: JSON.stringify({ encryptedPayload: encryptedData }),
    });

    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;

    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
};

export const validateOTP = async (otp, otpId) => {

    const mappedDetails = {
        sOtp: otp,
        sOtpId: otpId,
        sProductName: PRODUCT_NAME,
    };

    // const encryptedData = await encryptionService.encrypt(JSON.stringify(mappedDetails));
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));

    const response = await fetch(`${API_URL}/communications/validate-email-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'sKeyId': sessionStorage.getItem('KEY_ID')
        },
        body: JSON.stringify({ encryptedPayload: encryptedData }),
    });

    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;

    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
};

export const forgotPasswordService = {
    // Send OTP to email
    sendOTP: async (identifier) => {
  
      const mappedDetails = {
        sUserIdentifier: identifier,
        sProductName: PRODUCT_NAME,
      };
      // const encryptedData = await encryptionService.encrypt(JSON.stringify(mappedDetails));
      const encryptedData = encryptAES(JSON.stringify(mappedDetails));
      const response = await fetch(`${API_URL}/auth/forget-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sKeyId': sessionStorage.getItem('KEY_ID')
        },
        body: JSON.stringify({ encryptedPayload: encryptedData }),
      });
  
  
      const resposeJson = await response.json()
      // Wait for the text response
      const encryptedResponse = resposeJson.sResponse;
  
      // Decrypt the response
      const decryptedResponse = decryptAES(encryptedResponse);
      // Parse into BaseResponse format
      const parsedResponse = JSON.parse(decryptedResponse);
      return parsedResponse;
    },
  
    // Verify OTP
    validateOtpRestPassword: async (otp, otpId) => {
  
      const mappedDetails = {
        sOtp: otp,
        sOtpId: otpId,
        sProductName: PRODUCT_NAME,
      };
      // const encryptedData = await encryptionService.encrypt(JSON.stringify(mappedDetails));
      const encryptedData = encryptAES(JSON.stringify(mappedDetails));
  
      const response = await fetch(`${API_URL}/communications/validate-otp-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sKeyId': sessionStorage.getItem('KEY_ID')
        },
        body: JSON.stringify({ encryptedPayload: encryptedData }),
      });
  
  
      const resposeJson = await response.json()
      // Wait for the text response
      const encryptedResponse = resposeJson.sResponse;
  
      // Decrypt the response
      const decryptedResponse = decryptAES(encryptedResponse);
      // Parse into BaseResponse format
      const parsedResponse = JSON.parse(decryptedResponse);
      return parsedResponse;
    },
  
    // Reset password
    resetPassword: async (email, otp, newPassword) => {
      try {
        const response = await fetch(`${API_URL}/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'sKeyId': sessionStorage.getItem('KEY_ID')
          },
          body: JSON.stringify({ email, otp, newPassword }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to reset password');
        }
  
        const resposeJson = await response.json()
        // Wait for the text response
        const encryptedResponse = resposeJson.sResponse;
  
        // Decrypt the response
        const decryptedResponse = decryptAES(encryptedResponse);
        // Parse into BaseResponse format
        const parsedResponse = JSON.parse(decryptedResponse);
        return parsedResponse;
      } catch (error) {
        throw error;
      }
    },
  };

  export const changePassword = async (userIdentifier, oldPassword, newPassword) => {

    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
  
    const mappedDetails = {
      sUserIdentifier: userIdentifier,
      sOldPassword: oldPassword,
      sNewPassword: newPassword,
      sProductName: PRODUCT_NAME,
    };
  
    // const encryptedData = await encryptionService.encrypt(JSON.stringify(mappedDetails));
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));
  
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'userName': username,
        'sKeyId': sessionStorage.getItem('KEY_ID')
      },
      body: JSON.stringify({ encryptedPayload: encryptedData }),
    });
  
    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;
  
    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
  };

  export const callLogout = async (userName) => {

    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    const mappedDetails = {
      sUserName: userName,
      sProductName: PRODUCT_NAME,
    };
  
    // const encryptedData = await encryptionService.encrypt(JSON.stringify(mappedDetails));
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));
  
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'userName': username,
        'sKeyId': sessionStorage.getItem('KEY_ID')
      },
      body: JSON.stringify({ encryptedPayload: encryptedData }),
    });
  
    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;
  
    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
  };


  export const dashboardApi = async (username, identifier, token) => {

    const mappedDetails = {
      sIdentifier: identifier,
      sProductName: PRODUCT_NAME,
    };
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));
    const response = await fetch(`${API_URL}/url-service/get-dashboard-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'userName': username,
        'sKeyId': sessionStorage.getItem('KEY_ID')
      },
      body: JSON.stringify({ encryptedPayload: encryptedData }),
    });
    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;
  
    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
  };

  export const addEntry = async (data) => {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');

    const mappedDetails = {
      sLongUrl: data.longUrl,
      iExpiryDay: data.expiryDay,
      sUser: username,
    };
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));

    const response = await fetch(`${API_URL}/url-service/save-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sKeyId': sessionStorage.getItem('KEY_ID') || '',
        'Authorization': `Bearer ${token}`,
        'username': username || '',
      },
      body: JSON.stringify({ encryptedPayload: encryptedData }),
    });
    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;

    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
  }

  export const deleteEntry = async (data) => {

    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
  
    const mappedDetails = {
      sShortUrl: data.shortUrl,
      sUser: username
    };
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));
    const response = await fetch(`${API_URL}/url-service/delete-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'userName': username,
        'sKeyId': sessionStorage.getItem('KEY_ID')
      },
      body: JSON.stringify({ encryptedPayload: encryptedData }),
    });
    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;
  
    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
  };

  export const updateEntry = async (data) => {

    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
  
    const mappedDetails = {
      sLongUrl: data.longUrl,
      iExpiryDay: data.expiryDay,
      sUser: username
    };
    const encryptedData = encryptAES(JSON.stringify(mappedDetails));
    const response = await fetch(`${API_URL}/url-service/update-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'userName': username,
        'sKeyId': sessionStorage.getItem('KEY_ID')
      },
      body: JSON.stringify({ encryptedPayload: encryptedData }),
    });
    const resposeJson = await response.json()
    // Wait for the text response
    const encryptedResponse = resposeJson.sResponse;
  
    // Decrypt the response
    const decryptedResponse = decryptAES(encryptedResponse);
    // Parse into BaseResponse format
    const parsedResponse = JSON.parse(decryptedResponse);
    return parsedResponse;
  };
  