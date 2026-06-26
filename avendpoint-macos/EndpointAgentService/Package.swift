// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "EndpointAgentService",

    platforms: [
        .macOS(.v13)
    ],

    products: [
        .executable(
            name: "EndpointAgentService",
            targets: ["EndpointAgentService"]
        )
    ],

    dependencies: [

    ],

    targets: [
        .executableTarget(
            name: "EndpointAgentService",
            dependencies: []
        )
    ]
)