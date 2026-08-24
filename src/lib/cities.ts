export const PK_CITIES = [
  "Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta",
  "Hyderabad","Gujranwala","Sialkot","Bahawalpur","Sargodha","Sukkur","Larkana","Sheikhupura",
  "Mirpur Khas","Rahim Yar Khan","Gujrat","Jhang","Mardan","Kasur","Dera Ghazi Khan","Sahiwal",
  "Nawabshah","Okara","Mingora","Burewala","Jhelum","Chiniot","Kamoke","Sadiqabad","Wah Cantt",
  "Kohat","Khanpur","Dadu","Gojra","Mandi Bahauddin","Tando Allahyar","Daska","Pakpattan",
  "Hafizabad","Khanewal","Sambrial","Shikarpur","Hangu","Mansehra","Abbottabad","Muzaffargarh",
  "Attock","Vehari","Kot Addu","Charsadda","Jaranwala","Chishtian","Muridke","Jacobabad",
  "Khushab","Dera Ismail Khan","Chakwal","Gwadar","Turbat","Khuzdar","Chaman","Hub",
  "Sibi","Zhob","Loralai","Mastung","Skardu","Gilgit","Chitral","Bannu","Swabi","Nowshera",
  "Haripur","Murree","Bhakkar","Layyah","Mianwali","Bhalwal","Toba Tek Singh","Arifwala",
  "Khairpur","Tando Adam","Umerkot","Thatta","Badin","Mithi","Nankana Sahib","Narowal",
];

export const PROVINCE: Record<string, string> = {};
const punjab = ["Lahore","Faisalabad","Rawalpindi","Multan","Gujranwala","Sialkot","Bahawalpur","Sargodha","Sheikhupura","Rahim Yar Khan","Gujrat","Jhang","Kasur","Dera Ghazi Khan","Sahiwal","Okara","Burewala","Jhelum","Chiniot","Kamoke","Sadiqabad","Wah Cantt","Khanpur","Gojra","Mandi Bahauddin","Daska","Pakpattan","Hafizabad","Khanewal","Sambrial","Muzaffargarh","Attock","Vehari","Kot Addu","Jaranwala","Chishtian","Muridke","Khushab","Chakwal","Bhakkar","Layyah","Mianwali","Bhalwal","Toba Tek Singh","Arifwala","Nankana Sahib","Narowal","Murree"];
const sindh = ["Karachi","Hyderabad","Sukkur","Larkana","Mirpur Khas","Nawabshah","Dadu","Tando Allahyar","Shikarpur","Jacobabad","Khairpur","Tando Adam","Umerkot","Thatta","Badin","Mithi"];
const kpk = ["Peshawar","Mardan","Mingora","Kohat","Hangu","Mansehra","Abbottabad","Charsadda","Dera Ismail Khan","Bannu","Swabi","Nowshera","Haripur","Chitral"];
const balochistan = ["Quetta","Gwadar","Turbat","Khuzdar","Chaman","Hub","Sibi","Zhob","Loralai","Mastung"];
const gb = ["Skardu","Gilgit"];
const ict = ["Islamabad"];
punjab.forEach(c => PROVINCE[c] = "Punjab");
sindh.forEach(c => PROVINCE[c] = "Sindh");
kpk.forEach(c => PROVINCE[c] = "KPK");
balochistan.forEach(c => PROVINCE[c] = "Balochistan");
gb.forEach(c => PROVINCE[c] = "GB");
ict.forEach(c => PROVINCE[c] = "ICT");
