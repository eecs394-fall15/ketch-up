# Read more about app structure at http://docs.appgyver.com

module.exports =

  # See styling options for tabs and other native components in app/common/native-styles/ios.css or app/common/native-styles/android.css
  tabs: [
    {
      title: "All"
      id: "all"
      location: "card#index?type=all"
    }
    {
      title: "Friends"
      id: "friend"
      location: "card#index?type=friend"
    }
    {
      title: "Coworkers"
      id: "coworker"
      location: "card#index?type=coworker"
    }
    {
      title: "Family"
      id: "family"
      location: "card#index?type=family"
    }
  ]

  # rootView:
  #   location: "card#login"

  initialView:
    id: "initialView"
    location: "card#login"

  preloads: [
    {
      id: "learn-more"
      location: "example#learn-more"
    }
    {
      id: "using-the-scanner"
      location: "example#using-the-scanner"
    }
    {
      id: "settings"
      location: "example#settings"
    }
  ]

  # drawers:
  #   left:
  #     id: "leftDrawer"
  #     location: "example#drawer"
  #     showOnAppLoad: false
  #   options:
  #     animation: "swingingDoor"
