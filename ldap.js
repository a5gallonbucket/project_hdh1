const cfg = require('./config')
const { assert } = require('console');
const ldap = require('ldapjs');
const { nextTick, config } = require('process');

const client = ldap.createClient({
    url: cfg.ldap_uri
});

client.bind(cfg.ldap_username, cfg.ldap_password, (err) => {
    console.log(err)
});
client.unbind((err) => {
    console.error(err)
});


const opts = {
    filter: config.ldap_filter,
    scope: 'sub',
    attributes: ['givenname', 'sn', 'title', 'mail', 'department', 'manager', 'displayName', 'UserPrincipalName', 'employeeID', 'pwdLastSet', 'lastLogonTimestamp']
};


let results = [];

client.search(config.ldap_scope, opts, (err, res) => {
    console.error(err);

    res.on('searchRequest', (searchRequest) => {
        console.log('searchRequest: ', searchRequest.messageID);
    });
    res.on('searchEntry', (entry) => {
        let record = entry.object
        results.push(record);
    });
    res.on('searchReference', (referral) => {
        console.log('referral: ' + referral.uris.join());
    });
    res.on('error', (err) => {
        console.error('error: ' + err.message);
    });
    res.on('end', (result) => {
        console.log('status: ' + result.status);
        console.log(results)
    });
});

client.on('error', (err) => {
    console.error('Erroring: ', err);
});

client.on('connect', (con) => {
    console.log('Connected: ', con);
})