import re

def extract_features(url):
    """Return simple numeric features from URL as a dict (order matters)."""
    if url is None:
        url = ""
    url = str(url)
    return {
        "url_length": len(url),
        "has_https": int(url.lower().startswith("https")),
        "has_ip": int(bool(re.search(r"\d+\.\d+\.\d+\.\d+", url))),
        "num_digits": sum(c.isdigit() for c in url),
        "num_special": sum(c in "-@_?=&/" for c in url)
    }
