// swift-tools-version:5.10



import PackageDescription

let package = Package(

    name: "EndpointTray",

    platforms: [

        .macOS(.v13)

    ],

    products: [

        .executable(

            name: "EndpointTray",

            targets: ["EndpointTray"]

        )

    ],

    targets: [

        .executableTarget(

            name: "EndpointTray"

        )

    ]

)