import {Application, configureWunderGraphApplication, introspect, cors, IntrospectionPolicy, templates} from "@wundergraph/sdk";
import {appMock} from "./generated/mocks";

const federatedApi = introspect.federation({
    source: IntrospectionPolicy.Network,
    urls: [
        "http://localhost:4001/graphql",
        "http://localhost:4002/graphql",
        "http://localhost:4003/graphql",
        "http://localhost:4004/graphql",
    ]
});


const openAPI = introspect.openApi({
    source: {
        kind: "file",
        filePath: "users_oas.json"
    },
});

/*
uncomment this section to create an API from a GraphQL upstream

const graphQLAPI = introspect.graphql({
    source: IntrospectionPolicy.Network,
    url: "http://localhost:4000",
});*/


const myApplication = new Application({
    name: "app",
    apis: [
        federatedApi,
        openAPI,
        /*graphQLAPI*/
    ],
});

const mock = appMock({
    queries: {
        FakeProducts: (input) => {
            return {
                data: {
                    topProducts: [
                        {
                            name: "foo",
                            price: input.first,
                            upc: "bar",
                        }
                    ]
                }
            }
        },
        OasUsers: () => {
            return {
                data: {
                    getUsers: [
                        {
                            name: "Jens",
                            country_code: "DE",
                            id: 1,
                        }
                    ]
                }
            }
        }
    }
});

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
    application: myApplication,
    codeGenerators: [
        {
            templates: [templates.typescript.mocks]
        },
        {
            templates: [
                // use all the typescript react templates to generate a client
                ...templates.typescript.react,
            ],
            // create-react-app expects all code to be inside /src
            path: "../frontend/src/generated",
        }
    ],
    mock,
    cors: cors.allowAll,
});
