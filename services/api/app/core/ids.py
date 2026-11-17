from cuid2 import Cuid

_cuid = Cuid()


def new_id() -> str:
    return _cuid.generate()
