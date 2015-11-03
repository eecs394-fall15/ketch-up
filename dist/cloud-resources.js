if (window.ag == null) {
  window.ag = {};
}
window.ag.data = {
  "options": {
    "baseUrl": "https://rest-api.appgyver.com/v2/",
    "headers": {
      "steroidsApiKey": "a5e0cc0749ec359fd46f57925c6af1a4080029367cab707cd4ad0ea43fd02c7b",
      "steroidsAppId": 80046
    }
  },
  "resources": {
    "howzit": {
      "schema": {
        "fields": {
          "company": {
            "type": "string"
          },
          "createdAt": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "objectId": {
            "type": "string",
            "identity": true
          },
          "tags": {
            "type": "string"
          },
          "updatedAt": {
            "type": "string"
          }
        },
        "identifier": "objectId"
      }
    }
  }
};