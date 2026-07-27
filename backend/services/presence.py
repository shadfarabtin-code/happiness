import enum

ONLINE_TIMEOUT_SECONDS = 60

#The UI will decide the color, this is just for the meaning of them
class Presense( enum.Enum):
    Active = "active"
    Scheduled = "scheduled"
    Offline = "offline" 

#THIS IS UNNEEDED BECAUSE REACT WILL HANDLE IT, BUT I LEFT IT HERE FOR REFERENCE
def presence_color (state : Presense) -> str:
    match state:
        case Presense.Active:
            return "green"
        case Presense.Scheduled:
            return "yellow"
        case Presense.Offline:
            return "red"

#Code for the heart beat, every 30 seconds